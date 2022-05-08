'use strict';

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const St = imports.gi.St;
const ByteArray = imports.byteArray;

const ExtensionUtils = imports.misc.extensionUtils;
const Util = imports.misc.util;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Config = imports.misc.config;
const SHELL_MAJOR = parseInt(Config.PACKAGE_VERSION.split('.')[0]);
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

let SSHQuickConnect = class SSHQuickConnect extends PanelMenu.Button {

  _init() {
    super._init(0.0, `${Me.metadata.name} Indicator`, false);

    this.settings = this.getSettings();

    this.createIcon();

    this.createMenu(this.settings);
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
      style_class: 'system-status-icon'
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
    let hosts = [];
    
    let sshPath = settings.get_string('ssh-source');

    let paths = sshPath.split(':');

    paths.forEach(path => {
      // Replcae ~ with home directory
      path = path.replace('~', GLib.get_home_dir());
      // Get contents of file
      const fileStr = ByteArray.toString(
        GLib.file_get_contents(path)[1]
      );
      hosts = hosts.concat(this.parseHosts(fileStr));
    });

    // Add listeners  
    return hosts.forEach(item => {
      this.menu.addAction(item, e => this.sshToItem(item));
    });
  }

  /**
   * 
   * @param {String} hostString The ssh config file to parse
   * @returns {Array} An array of hosts
   */
  parseHosts(hostString) {
    return hostString.split('\n').join('{{NEWLINE}}').split('\r').join('{{NEWLINE}}').split('{{NEWLINE}}')
          .map(item => item.trim())
          .filter(item => item.indexOf('Host ') === 0)
          .map(item => item = item.split('Host ')[1]);
  }

  /**
   * Spawns a subprocess that opens the defualt terminal and runs `ssh ${item}`
   * @param {String} item The Host to ssh into
   * @returns {void}
   */
  sshToItem(item) {
    const command = ['x-terminal-emulator', '-e', 'ssh', item];
    try {
      let proc = Gio.Subprocess.new( command, Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE );
      // The callback is a force exit as there is no need for process communication
      return proc.communicate_utf8_async(null, null, () => proc.force_exit());
    } catch (e) {
      return logError(e);
    }
  }

  getSettings () {
    let GioSSS = Gio.SettingsSchemaSource;
    let schemaSource = GioSSS.new_from_directory(
      Me.dir.get_child("schemas").get_path(),
      GioSSS.get_default(),
      false
    );
    let schemaObj = schemaSource.lookup(
      'org.gnome.shell.extensions.ssh-quick-connect.ibrokemy.computer', true);
    if (!schemaObj) {
      throw new Error('cannot find schemas');
    }
    return new Gio.Settings({ settings_schema : schemaObj });
  }
}

/**
 * EXTENSION BOILERPLATE
 */

if (SHELL_MAJOR > 39 || SHELL_MINOR > 30) {
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
