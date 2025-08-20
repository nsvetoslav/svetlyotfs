# TFS Blame Feature

## Overview

The TFS Blame feature provides line-by-line author information for files in your TFS repository. The blame information is displayed in the editor gutter when you request it via the context menu.

## Prerequisites

1. **TFS Power Tools**: You must have TFS Power Tools installed on your system.
2. **tfpt.exe Path**: You need to configure the path to `tfpt.exe` in the extension settings.

## Configuration

To use the blame feature, you need to configure the following settings:

1. **tfpt.exe Path**:
   - Open VS Code settings (File → Preferences → Settings)
   - Search for "TFS" or "tfpt"
   - Set the `tfs.tfptLocation` setting to the path of your `tfpt.exe` file
   - Example: `C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\TFPT.exe`

2. **Enable/Disable Blame**:
   - Set `tfs.blame.enabled` to `true` or `false` to enable or disable the blame feature
   - Default: `true`

3. **Cache Size**:
   - Set `tfs.blame.cacheSize` to control how many files' blame information is cached
   - Default: `50`

## Usage

1. **View Blame Information**: 
   - Right-click in the editor for any file under TFS version control
   - Select "Show Blame Information" from the context menu
   - Author initials and changeset information will be displayed in the editor gutter
   - Hover over the gutter to see detailed information including full author name, changeset number, and date

2. **Performance**: 
   - Blame information is cached to improve performance when switching between files
   - Cache is automatically invalidated when files are modified

## Testing

The extension includes test commands to help verify the blame feature is working correctly:

1. **Test Annotate Command**: 
   - Command: `TFS: Test Annotate Command`
   - Tests the tfpt annotate command output parsing
   - Shows detailed information about the parsed blame data in the console

2. **Test Blame Integration**: 
   - Command: `TFS: Test Blame Integration`
   - Tests the integration of all blame feature components
   - Verifies that BlameManager, BlameDecorationsProvider, and TFSCommandExecutor are properly instantiated

## Troubleshooting

1. **Blame Information Not Displaying**:
   - Check that `tfs.tfptLocation` is correctly set to the path of `tfpt.exe`
   - Verify that the file is under TFS version control
   - Check the VS Code output panel for any error messages

2. **Performance Issues**:
   - Reduce the `tfs.blame.cacheSize` setting if you're experiencing memory issues
   - Disable the blame feature if it's causing performance problems

## Limitations

1. The blame feature requires TFS Power Tools to be installed
2. Only works with files that are under TFS version control
3. May not work with all versions of TFS Power Tools