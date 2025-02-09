# Overview

> [!CAUTION]
> I apologize everyone, this was just to see what the GNOME + Javascript developer expierience was like. I am no longer maintaining this.
> I have removed the extensions from the GNOME Shell Extensions directory.
> [View Existing Forks](https://github.com/ibrokemycomputer/gnome-shell-extension-ssh-quick-connect/forks?include=active&page=1&period=&sort_by=stargazer_counts)

---

# Old Instructions

Lists entries from your `~/.ssh/config` file, and launches them in the default terminal when clicked.

## Easy Install

Head on over to the [GNOME Shell Extension page](https://extensions.gnome.org/extension/3237/ssh-quick-connect/) and toggle it on.
_https://extensions.gnome.org/extension/3237/ssh-quick-connect/_

## WIP

- Allow more/other files than `~/.ssh/config`
- Setting screen

## TODO

- Custom terminal command
  - Do we need custom, or just proper handling of default terminal?
  - Can see this becoming a rabbit hole into "per-entry" options
    - Might not be unreasonable if unrecognized options are ignored/not errored by default
- Long/large list handling (scroll)
- Watch for file changes. ([Answer](https://stackoverflow.com/a/19063834/9884099), [Docs](https://developer.gnome.org/gio/stable/GFile.html#g-file-monitor))

## Wishlist

- Search

## Misc

To recompile the schema (for < GNOME44) , run `glib-compile-schemas schemas/`
