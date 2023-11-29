import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';


import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SSHQuickConnectPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a settings object
        window._settings = this.getSettings();
        // const settings = this.getSettings();
        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _('Configuration'),
            description: _('Configure file locations and command.'),
        });
        page.add(group);

        // Create a new preferences row
        const row = new Adw.ActionRow({
            title: _('SSH Config Locations'),
            subtitle: _('Use PATH syntax (aka `:` separated)'),
        });
        group.add(row);

        // Add Gtk text input
        const SOURCE_KEY = 'ssh-source';
        const input = new Gtk.Entry();
        input.set_text(window._settings.get_string(SOURCE_KEY));
        input.connect('changed', (widget) => {
            window._settings.set_string(SOURCE_KEY, widget.get_text());
        });

        // Add the input to the row
        row.add_suffix(input);

        // Create a new preferences row
        const rowCommand = new Adw.ActionRow({ 
            title: _('SSH Command'),
            subtitle: _('Don\'t change from DEFAULT unless you know what you are doing!')
        });
        group.add(rowCommand);

        // Add Gtk text input
        const SOURCE_KEY_COMMAND = 'ssh-command';
        const inputCommand = new Gtk.Entry();
        inputCommand.set_text(window._settings.get_string(SOURCE_KEY_COMMAND));
        inputCommand.connect('changed', (widget) => {
            window._settings.set_string(SOURCE_KEY_COMMAND, widget.get_text());
        });

        // Add the input to the row
        rowCommand.add_suffix(inputCommand);
    }
}