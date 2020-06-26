'use strict';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;

const ExtensionUtils = imports.misc.extensionUtils;
const Util = imports.misc.util;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Config = imports.misc.config;
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

let SSHQuickConnect = class SSHQuickConnect extends PanelMenu.Button {

  _init() {
    super._init(0.0, `${Me.metadata.name} Indicator`, false);

    this.createIcon();
    // Get ~/.ssh/config as string
    const hostString = GLib.spawn_command_line_sync("cat " + GLib.get_home_dir() + "/.ssh/config")[1].toString();
    // Parse string into array of Hosts
    this.hosts = hostString.split('\n').join('{{NEWLINE}}').split('\r').join('{{NEWLINE}}').split('{{NEWLINE}}')
                .map(item => item.trim())
                .filter(item => item.indexOf('Host ') === 0)
                .map(item => item = item.split('Host ')[1]);

    // Add listeners  
    this.hosts.forEach(item => {
      this.menu.addAction(item, e => this.sshToItem(item));
    });

  }
  
  /**
   * Spawns a subprocess that opens the defualt terminal and runs `ssh ${item}`
   * @param {String} item The Host to ssh into
   */
  sshToItem(item) {
    const command = ['x-terminal-emulator', '-e', 'ssh', item];
    try {
      let proc = Gio.Subprocess.new( command, Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE );
      // The callback is a force exit as there is no need for process communication
      proc.communicate_utf8_async(null, null, () => proc.force_exit());
    } catch (e) {
      logError(e);
    }
  }

  /**
   * Boilerplate to create an icon from an SVG
   */
  createIcon() {
    const iconUri = `file://${Me.path}/icons/icon.svg`;
    const iconFile = Gio.File.new_for_uri(iconUri);
    const gicon = new Gio.FileIcon({ file: iconFile });
    const icon = new St.Icon({
      gicon: gicon,
      style_class: 'system-status-icon'
    });
    this.add_child(icon);
  }

}

/**
 * EXTENSION BOILERPLATE
 */

// Compatibility with gnome-shell >= 3.32
if (SHELL_MINOR > 30) {
  SSHQuickConnect = GObject.registerClass(
    { GTypeName: 'SSHQuickConnect' },
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
}
