const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function fillPreferencesWindow(window) {
  // Use the same GSettings schema as in `extension.js`
  const settings = ExtensionUtils.getSettings(
    'org.gnome.shell.extensions.ssh-quick-connect.ibrokemy.computer');

  // Create a preferences page and group
  const page = new Adw.PreferencesPage();
  const group = new Adw.PreferencesGroup();
  page.add(group);

  // Create a new preferences row
  const row = new Adw.ActionRow({ 
    title: 'SSH Config Locations',
    subtitle: 'Use PATH syntax (aka `:` separated)'
  });
  group.add(row);

  // Add Gtk text input
  const SOURCE_KEY = 'ssh-source';
  const input = new Gtk.Entry();
  input.set_text(settings.get_string(SOURCE_KEY));
  input.connect('changed', (widget) => {
    settings.set_string(SOURCE_KEY, widget.get_text());
  });
  // Add the input to the row
  row.add_suffix(input);

  // Add our page to the window
  window.add(page);
}