// Base requirements
const St = imports.gi.St;
const Gio = imports.gi.Gio;
// Base requirements pt 2
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
// For reading files
const GLib = imports.gi.GLib;
const ByteArray = imports.byteArray;


const GObject = imports.gi.GObject;

const Config = imports.misc.config;
const SHELL_MAJOR = parseInt(Config.PACKAGE_VERSION.split('.')[0]);
const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);

let SSHQuickConnect = class SSHQuickConnect extends PanelMenu.Button {

  _init() {
    super._init(0.0, `${Me.metadata.name} Indicator`, false);

    this.settings = this.getSettings();

    this.createIcon();

    this.createMenu();
  }

  createMenu() {
    // Get ~/.ssh/config as string
    // TODO: Need to fix spawn_command_line_sync per review feedback
    // TODO: Read from list of sources that a user can set in settings,
    //       explicit request for '/etc/ssh/ssh_config' 
    const homeSSH = GLib.get_home_dir() + '/.ssh/config';
    const homeHostString = ByteArray.toString(GLib.file_get_contents(homeSSH)[1]);
    log('homeHostString', homeHostString);

    const etcSSH = '/etc/ssh/ssh_config';
    const etcHostString = ByteArray.toString(GLib.file_get_contents(etcSSH)[1]);

    // const hostString = homeHostString;
    log('hostString', hostString);
    const hostString = homeHostString + '\n' + etcHostString;

    // Parse string into array of Hosts
    this.hosts = hostString
                .split('\n')
                .join('{{NEWLINE}}')
                .split('\r')
                .join('{{NEWLINE}}')
                .split('{{NEWLINE}}')
                .map(item => item.trim())
                .filter(item => item.indexOf('Host ') === 0)
                .map(item => item = item.split('Host ')[1]);

    // Add listeners  
    this.hosts.forEach(item => {
      log('item', item);
      this.menu.addAction(item, e => this.sshToItem(item));
    });
  }

  /**
   * Spawns a subprocess that opens the defualt terminal and runs `ssh ${item}`
   * @param {String} item The Host to ssh into
   * @param {String} [sshCommand] The command to run on the remote host
   * 
   * @returns {void}
   */
  sshToItem(item, cmd = 'x-terminal-emulator -e ssh') {
    const command = cmd.split(' ');
    command.push(item);
    try {
      let proc = Gio.Subprocess.new( command, Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE );
      // The callback is a force exit as there is no need for process communication
      return proc.communicate_utf8_async(null, null, () => proc.force_exit());
    } catch (e) {
      return logError(e);
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
    this.menu.add_child(icon);
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
  log(`initializing ${Me.metadata.name} version ${Me.metadata.version}`);
}

function enable() {
  log(`enabling ${Me.metadata.name} version ${Me.metadata.version}`);

  indicator = new SSHQuickConnect();
  Main.panel.addToStatusArea(`${Me.metadata.name} Indicator`, indicator);
}

function disable() {
  log(`disabling ${Me.metadata.name} version ${Me.metadata.version}`);

  if (indicator !== null) {
    indicator.destroy();
    indicator = null;
  }
}
