# TFS Extension

**Visual Studio Code extension** designed to streamline your integration with **Team Foundation Server (TFS)**. Manage pending changes, undo edits, compare files, and set your active workspace—all from within your editor.

---

## 🎬 Preview
- **Pending changes view**

![App Screenshot](https://i.postimg.cc/hvLhjVP2/image.png)

- **Change workspace**

![App Screenshot](https://i.postimg.cc/KvbRWpJw/image.png)

After clicking the "Workspaces" button located on the left side of the status bar, a quick pick shows.

![App Screenshot](https://i.postimg.cc/L8C5n92F/image.png)
---
## Usage
1. **Navigate to Pending Changes View**  
   Open the *Pending Changes* view to see all your uncommitted changes.
2. **Right-Click for Options**  
   Right-click on a file or folder to access various options such as undoing changes or comparing with the latest version.
3. **Set Active Workspace**  
   Use the status bar at the bottom of the screen to set the active workspace for your project.
4. **Configure tf.exe Path**  
   Set the `tf.exe` path in **File** → **Preferences** → **Settings**.  
   To find the path, open the Visual Studio Developer Command Prompt and run the command:  
   ```bash
   where tf.exe

![App Screenshot](https://i.postimg.cc/43cGss35/image.png)

![App Screenshot](https://i.postimg.cc/wM2HZ2BY/image.png)
    
## 🚀 Features

- **Add** *file* applies directly in source control.
- **Rename** *file* applies directly in source control.
- **Delete** *file* applies directly in source control.
- **Move** *file* to another directory applies directly in source control.
- **Move** *directory* applies directly in source control.
- **Pending Changes View**:  
  Track and manage all pending changes in your workspace.
- **Quick File Actions**:  
  Right-click on files or folders to:
  - Undo pending changes.
  - Compare files with the latest TFS version.
- **Status Bar Integration**:  
  Quickly set or switch the active workspace directly from the status bar.
---

## 🛠️ Getting Started

1. **View Pending Changes**  
   Open the Pending Changes View to monitor and manage modifications across your project.
2. **File and Folder Options**  
   Right-click on files or folders to:
   - Undo changes.
   - Compare files with the latest version in TFS.
3. **Workspace Management**  
   Manage your active workspace directly from the **Visual Studio Code** status bar.

---

## 💡 Feedback and Contributions
Your feedback is essential to improve the extension!
- **Report Issues or Suggest Features**:  
  [Submit an issue](https://github.com/nsvetoslav/svetlyotfs/issues) on GitHub.
- **Contribute to Development**:  
  Fork the repository and submit a pull request to help enhance the extension.
---

## 📂 Source Code

The source code is available on [GitHub](https://github.com/nsvetoslav/svetlyotfs).  
Explore, contribute, and help refine this extension to make it even better.

---

## 📜 License

This project is licensed under the [MIT License](https://github.com/nsvetoslav/svetlyotfs/blob/main/LICENCE).  
Enjoy the freedom to use, modify, and share.

---

## ⭐ Support 

If the extension has improved your workflow, please consider leaving a review [here](https://marketplace.visualstudio.com/items?itemName=SvetoslavIvanovNikolov.svetlyo-tfs&ssr=false#review-details).
