# Overview

> ATTENTION: Hi everyone. I try to keep this up to date but fall behind often. No, this isn't abandonened. If you want to help/submit a PR I'll do my best to get them merged ASAP!

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


## Deploying a New Version

1. Bump the version number in `metadata.json`
2. ZIP everything but the git files
3. Upload to the [GNOME Shell Extensions site](https://extensions.gnome.org/extension/3237/ssh-quick-connect/).