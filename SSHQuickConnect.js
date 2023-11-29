
import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { getExtensionObject } from './extension.js'

const ByteArray = imports.byteArray;


let fileTimer;

export class SSHQuickConnect extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'SSH Quick Connect Indicator', false);
    
        this.settings = getExtensionObject().getSettings(
            "org.gnome.shell.extensions.ssh-quick-connect.ibrokemy.computer"
        );
        
        this.createIcon();
    
        this.createMenu(this.settings);
    
        this.settingsUpdateListener();
    
        this.fileListenerHack();
    
   }

   /**
   * Creates panel icon
   * 
   * @returns {void}
   */
    createIcon() {
        const gicon = Gio.icon_new_for_string(
            getExtensionObject().path + "/icons/icon.svg"
          );

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
        this.menu.removeAll();

        let hosts = [];
        let sshPath = settings.get_string('ssh-source');
        let paths = sshPath.split(':');

        paths.forEach(path => {
            // Replace ~ with home directory
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
     * Watch sshPath setting for changes and update menu
     * 
     * @returns {void}
     */
    settingsUpdateListener() {
        this.settings.connect('changed::ssh-source', () => {
        // log('settings changed');
        this.createMenu();
        });
    }

    /**
     * Parses the ssh config file for hosts
     * 
     * @param {String} hostString The ssh config file to parse
     * @returns {Array} An array of hosts
    */
    parseHosts(hostString) {
        return hostString
            .split('\n')
            .join('{{NEWLINE}}')
            .split('\r')
            .join('{{NEWLINE}}')
            .split('{{NEWLINE}}')
            .map(item => item.trim())
            .filter(item => item.indexOf('Host ') === 0)
            .map(item => item = item.split('Host ')[1]);
    }

    /**
    * Spawns a subprocess that opens indicator
    **/
    sshToItem(item) {
        let terminalCommand = this.getTerminalCommand();
        let command = terminalCommand.split(' ');
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
    * Hack time-based loop to monitor file changes. For whatever reason I'm having
    * issues with the file monitor.
    * 
    * @param {Integer} timeout Time in seconds to recheck files for changes
    */
    fileListenerHack(timeout = 10) {
        fileTimer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, timeout, () => {
            // log('hacky loop');
            this.createMenu();
            return this.fileListenerHack();
        });
    }

    stop() {
        if (fileTimer) {
            GLib.Source.remove(fileTimer);
            fileTimer = null;
        }
    }
    /**
    * Huge shoutout to the VSCode devs for the inspiration here
    * 
    * @returns String Terminal command to use
    * 
    * @see https://github.com/microsoft/vscode/blob/dce493cb6e36346ef2714e82c42ce14fc461b15c/src/vs/platform/externalTerminal/node/externalTerminalService.ts#L281-L292
    */
    getTerminalCommand() {
        const file = Gio.File.new_for_path('/etc/debian_version');
        let isDebian = 0;
        try {
            isDebian = file.query_info('standard::*', 0, null)?.get_size() > 0;
        } catch(e) {
            isDebian = 0
        }
        const DESKTOP_SESSION = GLib.getenv('DESKTOP_SESSION');
        const SSH_COMMAND = ' -e ssh';
        let LINUX_TERMINAL = 'xterm';
        let CUSTOM_SSH = this.settings.get_string('ssh-command');

        if (CUSTOM_SSH !== "DEFAULT") {
            return CUSTOM_SSH;
        } 
        
        if (isDebian) {
            LINUX_TERMINAL = 'x-terminal-emulator';
        } else if (DESKTOP_SESSION === 'gnome' || DESKTOP_SESSION === 'gnome-classic') {
            LINUX_TERMINAL = 'gnome-terminal';
        } else if (GLib.getenv('COLORTERM')) {
            LINUX_TERMINAL = GLib.getenv('COLORTERM');
        } else if (GLib.getenv('TERM')) {
            LINUX_TERMINAL = GLib.getenv('TERM');
        }

        return LINUX_TERMINAL + SSH_COMMAND;
    }
}