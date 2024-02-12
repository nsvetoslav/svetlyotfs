# SvetlyoTfs Extension

SvetlyoTfs is a Visual Studio Code extension designed to enhance Team Foundation Server (TFS) integration within your development workflow. With SvetlyoTfs, you can efficiently manage pending changes, undo changes, compare files with the latest version, and set the active workspace directly from the status bar.

### Supported Operations
- [x] Addition: Automatically adds newly created files and folders to source control.
- [x] Renaming: Renames files in source control when renamed locally.
- [x] Change File Directory / Folder Directory: Updates source control to reflect changes in file or folder locations.
- [x] Deletion: Deletes files and folders from source control when deleted locally.

### Bugs to be Fixed
- [ ] Moving file to another directory when it's added file (still not checked in source control).
- [ ] Moving files to directory more than 1 time.

### To Be Added
- [ ] View for excluded and included changes.
- [ ] Webview for file history / directory history.
- [ ] Check in files with tasks and tasks preview (name, and task ID).

## Installation
1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the square icon in the Sidebar.
3. Search for "SvetlyoTfs" in the Extensions Marketplace.
4. Click Install to install the extension.
5. Once installed, the extension will be activated automatically.

## Usage
1. Navigate to the Pending Changes View to see all pending changes.
2. Right-click on a file or folder to access options such as undoing changes or comparing with the latest version.
3. Use the status bar to set the active workspace for your project.

## Feedback and Contribution
Your feedback is valuable! If you encounter any issues or have suggestions for improvements, please [file an issue](https://github.com/nsvetoslav/svetlyotfs/issues) on GitHub.

Contributions are also welcome! If you'd like to contribute to the development of SvetlyoTfs, feel free to submit a pull request.

## License
This extension is licensed under the [MIT License]

---

Thank you for using SvetlyoTfs! If you find it helpful, please consider leaving a review or rating on the Visual Studio Code Marketplace. Your support is greatly appreciated!
