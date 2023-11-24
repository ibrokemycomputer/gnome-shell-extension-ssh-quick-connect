"use strict";
/* Base imports pt 1 */
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const ByteArray = imports.byteArray;
/* Base imports pt 2 */
const ExtensionUtils = imports.misc.extensionUtils;
const Util = imports.misc.util;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
/* Part of my hacky bandaid */
const Mainloop = imports.mainloop;
/* Other */
const Config = imports.misc.config;
const SHELL_MAJOR = parseInt(Config.PACKAGE_VERSION.split(".")[0]);
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split(".")[1]);

let fileTimer;

let SSHQuickConnect = class SSHQuickConnect extends PanelMenu.Button {
  _init() {
    super._init(0.0, `${Me.metadata.name} Indicator`, false);

    this.settings = ExtensionUtils.getSettings(
      "org.gnome.shell.extensions.ssh-quick-connect.ibrokemy.computer"
    );

    this.createIcon();

    this.createMenu(this.settings);

    this.settingsUpdateListener();

    // this.fileChangeListener();

    this.fileListenerHack();
  }

  /**
   * Creates panel icon
   *
   * @returns {void}
   */
  createIcon() {
    const iconUri = `file://${Me.path}/icons/icon.svg`;
    const iconFile = Gio.File.new_for_uri(iconUri);
    const gicon = new Gio.FileIcon({ file: iconFile });
    const icon = new St.Icon({
      gicon: gicon,
      style_class: "system-status-icon",
    });
    return this.add_child(icon);
  }

  /**
   * Parses the "ssh-source" setting and creates a menu item for each host
   *
   * @param {Gio.Settings} settings The settings object
   * @returns {void}
   */
  createMenu(settings = this.settings) {
    this.menu.removeAll();

    let hosts = [];
    let sshPath = settings.get_string("ssh-source");
    let paths = sshPath.split(":");

    paths.forEach((path) => {
      // Replcae ~ with home directory
      path = path.replace("~", GLib.get_home_dir());
      // Get contents of file
      const fileStr = ByteArray.toString(GLib.file_get_contents(path)[1]);
      hosts = hosts.concat(this.parseHosts(fileStr));
    });

    // Add listeners
    return hosts.forEach((item) => {
      this.menu.addAction(item, (e) => this.sshToItem(item));
    });
  }

  // Watch sshPath setting for changes and update menu
  settingsUpdateListener() {
    this.settings.connect("changed::ssh-source", () => {
      // log('settings changed');
      this.createMenu();
    });
  }

  /**
   *
   * @param {String} hostString The ssh config file to parse
   * @returns {Array} An array of hosts
   */
  parseHosts(hostString) {
    return hostString
      .split("\n")
      .join("{{NEWLINE}}")
      .split("\r")
      .join("{{NEWLINE}}")
      .split("{{NEWLINE}}")
      .map((item) => item.trim())
      .filter((item) => item.indexOf("Host ") === 0)
      .map((item) => (item = item.split("Host ")[1]));
  }

  /**
   * Spawns a subprocess that opens indicator
   **/
  sshToItem(item) {
    let terminalCommand = this.getTerminalCommand();
    let command = terminalCommand.split(" ");
    command.push(item);
    try {
      let proc = Gio.Subprocess.new(
        command,
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
      );
      // The callback is a force exit as there is no need for process communication
      return proc.communicate_utf8_async(null, null, () => proc.force_exit());
    } catch (e) {
      return logError(e);
    }
  }

  /**
   * Watch each ssh-source setting for file changes and update menu
   */
  // fileChangeListener() {
  //   let paths = this.settings.get_string('ssh-source').split(':');
  //   paths.forEach(path => {
  //     const file = Gio.File.new_for_path(path);
  //     const fileMonitor = file.monitor(Gio.FileMonitorFlags.WATCH_MOVES, null);
  //     fileMonitor.connect('changed', (file, otherFile, eventType) => {
  //       this.createMenu();
  //     });
  //   });
  // }

  /**
   * Hack time-based loop to monitor file changes. For whatever reason I'm having
   * issues with the file monitor.
   *
   * @param {Integer} timeout Time in seconds to recheck files for changes
   */
  fileListenerHack(timeout = 10) {
    fileTimer = Mainloop.timeout_add_seconds(timeout, () => {
      // log('hacky loop');
      this.createMenu();
      return this.fileListenerHack();
    });
  }

  /**
   * Huge shoutout to the VSCode devs for the inspiration here
   *
   * @returns String Terminal command to use
   *
   * @see https://github.com/microsoft/vscode/blob/dce493cb6e36346ef2714e82c42ce14fc461b15c/src/vs/platform/externalTerminal/node/externalTerminalService.ts#L281-L292
   */
  getTerminalCommand() {
    const file = Gio.File.new_for_path("/etc/debian_version");
    let isDebian = 0;
    try {
      isDebian = file.query_info("standard::*", 0, null)?.get_size() > 0;
    } catch (e) {
      isDebian = 0;
    }
    const DESKTOP_SESSION = GLib.getenv("DESKTOP_SESSION");
    const SSH_COMMAND = " -e ssh";
    let LINUX_TERMINAL = "xterm";
    let CUSTOM_SSH = this.settings.get_string("ssh-command");

    if (CUSTOM_SSH !== "DEFAULT") {
      return CUSTOM_SSH;
    }

    if (isDebian) {
      LINUX_TERMINAL = "x-terminal-emulator";
    } else if (
      DESKTOP_SESSION === "gnome" ||
      DESKTOP_SESSION === "gnome-classic"
    ) {
      LINUX_TERMINAL = "gnome-terminal";
    } else if (GLib.getenv("COLORTERM")) {
      LINUX_TERMINAL = GLib.getenv("COLORTERM");
    } else if (GLib.getenv("TERM")) {
      LINUX_TERMINAL = GLib.getenv("TERM");
    }

    return LINUX_TERMINAL + SSH_COMMAND;
  }
};

/**
 * EXTENSION BOILERPLATE
 */

if (SHELL_MAJOR > 39 || SHELL_MINOR > 30) {
  SSHQuickConnect = GObject.registerClass(
    { GTypeName: "SSHQuickConnect" },
    SSHQuickConnect
  );
}

let indicator = null;

function init() {
  // log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
}

function enable() {
  // log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);
  indicator = new SSHQuickConnect();
  Main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator);
}

function disable() {
  // log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);
  if (indicator !== null) {
    indicator.destroy();
    indicator = null;
  }
  if (fileTimer) {
    GLib.Source.remove(fileTimer);
    fileTimer = null;
  }
}
