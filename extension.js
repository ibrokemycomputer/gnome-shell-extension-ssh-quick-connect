import { panel } from 'resource:///org/gnome/shell/ui/main.js';
import { SSHQuickConnect } from './SSHQuickConnect.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import GObject from 'gi://GObject';

export const getExtensionObject = () => Extension.lookupByUUID('ssh-quick-connect@ibrokemy.computer');

export default class SSHQuickConnectExtension extends Extension {
    _indicator;
    _settings;

    enable() {
        this._settings = this.getSettings();
        this._indicator = new SSHQuickConnect();
        panel.addToStatusArea('ssh-quick-connect', this._indicator);
    }

    disable() {
        this._indicator.stop();
        this._indicator.destroy();
        this._indicator = undefined;
        this._settings = undefined;
    }
}

GObject.registerClass(
    {GTypeName: 'SSHQuickConnect'},
    SSHQuickConnect
);