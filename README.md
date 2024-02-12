
# SvetlyoTfs Extension 

SvetlyoTfs is a Visual Studio Code extension designed to enhance Team Foundation Server (TFS) integration within your development workflow. 

![Logo](https://i.postimg.cc/4xZVzNDK/tfs.png)


## Roadmap 
#### Supported Operations
- [x]  Addition: Automatically adds newly created files and folders to source control.
- [x]  Renaming: Renames files in source control when renamed locally.
- [x]  Change File Directory / Folder Directory: Updates source control to reflect changes in file or folder locations.
- [x]  Deletion: Deletes files and folders from source control when deleted locally.

#### Bugs to be Fixed
- [ ]  Moving file to another directory when it's added file (still not checked in source control).
- [ ]  Moving files to directory more than 1 time.

#### To Be Added
- [ ]  View for excluded and included changes.
- [ ]  Webview for file history / directory history.
- [ ]  Check in files with tasks and tasks preview (name, and task ID).

## Installation
    1. Open Visual Studio Code.
    2. Go to the Extensions view by clicking on the square icon in the Sidebar.
    3. Search for "TFS" in the Extensions Marketplace.
    4. Click Install to install the extension.
    5. Once installed, the extension will be activated automatically.

## Usage
    1. Navigate to the Pending Changes View to see all pending changes.
    2. Right-click on a file or folder to access options such as undoing changes or comparing with the latest version.
    3. Use the status bar to set the active workspace for your project.
    4. Set the tf.exe path in File -> Preferences -> Settings ( you can find it by opening  visual studio developer command prompt and run the command "where tf.exe") 
![App Screenshot](https://i.postimg.cc/43cGss35/image.png)

![App Screenshot](https://i.postimg.cc/wM2HZ2BY/image.png)
    
## Compiling

```bash
  cd vscode-tfs 
  npm install --force
  npm run compile
```
    

## Screenshots

#### Pending changes view 
![App Screenshot](https://i.postimg.cc/hvLhjVP2/image.png)

#### Change workspace  
![App Screenshot](https://i.postimg.cc/KvbRWpJw/image.png)
After clicking the "Workspaces" button located on the left side of the status bar, a quick pick shows.
![App Screenshot](https://i.postimg.cc/L8C5n92F/image.png)

## Feedback and Contribution
Your feedback is valuable! If you encounter any issues or have suggestions for improvements, please [file an issue](https://github.com/nsvetoslav/svetlyotfs/issues) on GitHub.


[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/nsvetoslav/svetlyotfs/blob/main/LICENCE)
