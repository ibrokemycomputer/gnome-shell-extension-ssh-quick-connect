import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SSHQuickConnectPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings(
      "org.gnome.shell.extensions.ssh-quick-connect.ibrokemy.computer"
    );
    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);
    // Create a new preferences row
    const row = new Adw.ActionRow({
      title: "SSH Config Locations",
      subtitle: "Use PATH syntax (aka `:` separated)",
    });
    group.add(row);
    // Add Gtk text input
    const SOURCE_KEY = "ssh-source";
    const input = new Gtk.Entry();
    input.set_text(settings.get_string(SOURCE_KEY));
    input.connect("changed", (widget) => {
      settings.set_string(SOURCE_KEY, widget.get_text());
    });
    // Add the input to the row
    row.add_suffix(input);
    // Create a new preferences row
    const rowCommand = new Adw.ActionRow({
      title: "SSH Command",
      subtitle: "Don't change from DEFAULT unless you know what you are doing!",
    });
    group.add(rowCommand);
    // Add Gtk text input
    const SOURCE_KEY_COMMAND = "ssh-command";
    const inputCommand = new Gtk.Entry();
    inputCommand.set_text(settings.get_string(SOURCE_KEY_COMMAND));
    inputCommand.connect("changed", (widget) => {
      settings.set_string(SOURCE_KEY_COMMAND, widget.get_text());
    });
    // Add the input to the row
    rowCommand.add_suffix(inputCommand);
    // Add our page to the window
    window.add(page);
  }
}