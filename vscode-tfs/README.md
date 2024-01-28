# TFS extension for Visual Studio Code

**Visual Studio Code Team Foundation Server integration**

[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/release/nsvetoslav/vscode-tfs.svg?style=flat-square)](https://github.com/nsvetoslav/vscode-tfs/releases)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/nsvetoslav.vscode-tfs.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=nsvetoslav.vscode-tfs)
[![David](https://img.shields.io/david/nsvetoslav/vscode-tfs.svg?style=flat-square)](https://david-dm.org/nsvetoslav/vscode-tfs?type=dev)
[![David](https://img.shields.io/david/dev/nsvetoslav/vscode-tfs.svg?style=flat-square)](https://david-dm.org/nsvetoslav/vscode-tfs?type=dev)

---

## Important!

> **You MUST have a Visual Studio with Team Foundation Server features to be able to use this extension.**

## Installation

Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter.
```
ext install nsvetoslav.vscode-tfs
```

## Configuration

You need to provide a path to the TF command line client used by the extension to perform TFS actions.
To set this path, add the following entry to Settings (**File > Preferences > Settings**):

```javascript
    "tfs.location": "<path-to-tf-command-line>"
```

If you plan to use the `tf.exe` command line provided by the Visual Studio IDE, the value to provide will be similar to `C:\\Program Files (x86)\\Microsoft Visual Studio 14.0\\Common7\\IDE\\TF.exe`.

## Usage

Hit **`Alt + T`** to list available commands for the current edited file.

## List of available commands

- **Get** `vscode-tfs.get`
- **Check Out for Edit** `vscode-tfs.checkout`
- **Check In** `vscode-tfs.checkin`
- **Add** `vscode-tfs.add`
- **Delete** `vscode-tfs.delete`
- **Undo Pending Changes** `vscode-tfs.undo`
- **Open in Browser** `vscode-tfs.openInBrowser`

## Issues

Please report any issue or comment [here](https://github.com/nsvetoslav/vscode-tfs/issues).

## Contribute

To be able to contribute to TFS development, you need to be at ease with **NodeJS** language and **Git** usage.

```sh
git clone https://github.com/nsvetoslav/vscode-tfs.git
cd vscode-tfs
yarn install
yarn test
```

## About the fork

This is a fork of [ivangabriele.vscode-tfs](https://github.com/ivangabriele/vscode-tfs). The changes are:

- Configurable path to `tf.exe` binary.
- New TFS menu commands.
- Improved error handling.

## Links

- [TFS extension on Visual Studio Market Place](https://marketplace.visualstudio.com/items/nsvetoslav.vscode-tfs)
- [TFS extension on Github](https://github.com/nsvetoslav/vscode-tfs)
- [MIT Licence](https://github.com/nsvetoslav/vscode-tfs/blob/master/LICENCE)
