# package-installer README

This is the README for the "package-installer" extension. This extension enhances your development experience in Visual Studio Code by automatically detecting missing npm packages in import statements and providing easy installation options.

## Features

The `package-installer` extension offers the following features to streamline your workflow:

- **Hover Install**: Hover over an uninstalled npm package in an import statement (e.g., `'axios'`) to see an "Install [package]" link. Clicking it installs the package instantly.
- **Quick Fix**: Use the lightbulb (Quick Fix) feature to install a missing package with a single click.
- **Install All Dependencies**: Run a command to install all missing npm packages referenced in the current file, ignoring local imports (e.g., `@/components`).
- **Enhanced UI**: Success and error messages include actionable buttons like "Open package.json" and "View Terminal" for better interaction.



> **Tip**: Consider creating short GIF animations to demonstrate these features in action using tools like LICEcap or ScreenToGif for a more engaging README.

## Requirements

- **Node.js**: Version 14 or later, available from [nodejs.org](https://nodejs.org).
- **Visual Studio Code**: The latest version, downloadable from [code.visualstudio.com](https://code.visualstudio.com).
- **npm**: Installed with Node.js, used for package installation.

No additional configuration is required, but ensure your project has a `package.json` file for the extension to detect dependencies.

## Extension Settings

This extension does not currently contribute any VS Code settings. Future updates may include configurable options such as:

- `packageInstaller.autoInstall`: Enable/disable automatic installation on hover (default: `false`).
- `packageInstaller.packageManager`: Select the package manager (e.g., `npm`, `yarn`) (default: `npm`).

## Known Issues

- The extension may attempt to install a package if a local module name accidentally matches an npm package name (e.g., a folder named `react`).
- Installation fails if the project directory lacks write permissions or internet connectivity.
- Aliases other than `@/` (e.g., `~/`) are not currently supported for local import detection.

## Release Notes

### 0.0.1
Initial release of the `package-installer` extension with hover-based package installation and "Install All Dependencies" command to install all missing npm packages in a .tsx or .jsx file.

---

## Following Extension Guidelines

This extension adheres to the best practices outlined in the [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines). Ensure compatibility with VS Code's extensibility API and provide clear documentation for users.

## Working with Markdown

You can author and preview this README using Visual Studio Code. Useful keyboard shortcuts include:

- Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
- Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
- Press `Ctrl+Space` (Windows, Linux, macOS) to see Markdown snippets.

## For More Information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy using package-installer!**