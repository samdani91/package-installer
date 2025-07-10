import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export function activate(context: vscode.ExtensionContext) {

    const hoverProvider = vscode.languages.registerHoverProvider(
        ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
        {
            provideHover(document, position, token) {
                const range = document.getWordRangeAtPosition(position, /['"]([^'"]+)['"]/);
                if (!range) {return;}
                const moduleName = document.getText(range).slice(1, -1);
                const packageJsonPath = findPackageJson(document.uri.fsPath);

                if (!packageJsonPath) {
                    return new vscode.Hover('No package.json found in project.');
                }

                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

                if (!dependencies[moduleName]) {
                    const markdown = new vscode.MarkdownString();
                    markdown.appendMarkdown(`Package \`${moduleName}\` is not installed. `);
                    markdown.appendMarkdown(`[Install ${moduleName}](command:package-installer.installPackage?${encodeURIComponent(JSON.stringify({ moduleName, packageJsonPath }))})`);
                    markdown.isTrusted = true;
                    return new vscode.Hover(markdown, range);
                }
                return undefined;
            }
        }
    );

    
    const codeActionProvider = vscode.languages.registerCodeActionsProvider(
        ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'],
        {
            provideCodeActions(document, range, context, token) {
                const moduleName = document.getText(range).slice(1, -1);
                const packageJsonPath = findPackageJson(document.uri.fsPath);

                if (!packageJsonPath) {return [];}

                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

                if (!dependencies[moduleName]) {
                    const action = new vscode.CodeAction(
                        `Install ${moduleName}`,
                        vscode.CodeActionKind.QuickFix
                    );
                    action.command = {
                        command: 'package-installer.installPackage',
                        title: `Install ${moduleName}`,
                        arguments: [{ moduleName, packageJsonPath }]
                    };
                    return [action];
                }
                return [];
            }
        },
        { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    );

    
    const installCommand = vscode.commands.registerCommand(
        'package-installer.installPackage',
        async ({ moduleName, packageJsonPath }: { moduleName: string; packageJsonPath: string }) => {
            const projectRoot = path.dirname(packageJsonPath);
            try {
                await execPromise(`npm install ${moduleName}`, { cwd: projectRoot });
                
                const action = await vscode.window.showInformationMessage(
                    `Successfully installed ${moduleName}!`,
                    { modal: false },
                    'Open package.json',
                    'View Terminal'
                );
                if (action === 'Open package.json') {
                    const doc = await vscode.workspace.openTextDocument(packageJsonPath);
                    await vscode.window.showTextDocument(doc);
                } else if (action === 'View Terminal') {
                    vscode.commands.executeCommand('workbench.action.terminal.focus');
                }
            } catch (error) {
                
                const errorMessage = error instanceof Error ? error.message : String(error);
                
                const action = await vscode.window.showInformationMessage(
                    `Failed to install ${moduleName}: ${errorMessage}`,
                    { modal: false },
                    'Retry',
                    'View Terminal'
                );
                if (action === 'Retry') {
                    await vscode.commands.executeCommand('package-installer.installPackage', { moduleName, packageJsonPath });
                } else if (action === 'View Terminal') {
                    vscode.commands.executeCommand('workbench.action.terminal.focus');
                }
            }
        }
    );

    
    const installAllCommand = vscode.commands.registerCommand(
        'package-installer.installAllDependencies',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found.');
                return;
            }

            const document = editor.document;
            const packageJsonPath = findPackageJson(document.uri.fsPath);
            if (!packageJsonPath) {
                vscode.window.showErrorMessage('No package.json found in project.');
                return;
            }

            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            
            const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
            const modules = new Set<string>();
            let match;
            while ((match = importRegex.exec(document.getText())) !== null) {
                const moduleName = match[1];
                if (!/^(?:\.\.?(?:\/|$)|@\/)/.test(moduleName)) {
                    modules.add(moduleName);
                }
            }

            const missingModules = Array.from(modules).filter(module => !dependencies[module]);

            if (missingModules.length === 0) {
                vscode.window.showInformationMessage('All imported modules are already installed.');
                return;
            }

            const projectRoot = path.dirname(packageJsonPath);
            try {
                await execPromise(`npm install ${missingModules.join(' ')}`, { cwd: projectRoot });
                vscode.window.showInformationMessage(`Successfully installed ${missingModules.join(', ')}`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                vscode.window.showErrorMessage(`Failed to install dependencies: ${errorMessage}`);
            }
        }
    );

    context.subscriptions.push(hoverProvider, codeActionProvider, installCommand, installAllCommand);
}


function findPackageJson(filePath: string): string | null {
    let currentDir = path.dirname(filePath);
    while (currentDir !== path.parse(currentDir).root) {
        const packageJsonPath = path.join(currentDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            return packageJsonPath;
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}

export function deactivate() {}