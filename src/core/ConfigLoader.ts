import * as vscode from "vscode";
import * as path from "path";

export interface EcsConfig {
  ecsPath: string;
  configPath: string;
  onSave: boolean;
  workspaceRoot: string;
}

export class ConfigLoader {
  public static loadConfig(): EcsConfig {
    const workspaceFolder = ConfigLoader.getWorkspaceFolder();
    const config = ConfigLoader.getExtensionConfig();

    const ecsPath = ConfigLoader.resolveEcsPath(workspaceFolder, config);
    const configPath = ConfigLoader.resolveConfigPath(workspaceFolder, config);

    const onSave = config.get<boolean>("onsave", false);

    const workspaceRoot = workspaceFolder;

    return { ecsPath, configPath, onSave, workspaceRoot };
  }

  public static loadConfigForFile(resource: vscode.Uri): EcsConfig {
    const workspaceFolder = ConfigLoader.getWorkspaceFolderForFile(resource);
    const config = ConfigLoader.getExtensionConfig();

    const ecsPath = ConfigLoader.resolveEcsPath(workspaceFolder, config);
    const configPath = ConfigLoader.resolveConfigPath(workspaceFolder, config);
    const onSave = config.get<boolean>("onsave", false);

    const workspaceRoot = workspaceFolder;

    return { ecsPath, configPath, onSave, workspaceRoot };
  }

  private static resolvePath(
    workspaceFolder: string,
    config: vscode.WorkspaceConfiguration,
    settingKey: string,
    defaultRelativePath: string
  ): string {
    let filePath = config.get<string>(settingKey, "");
    if (filePath) {
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(workspaceFolder, filePath);
      }
    } else {
      filePath = path.join(workspaceFolder, defaultRelativePath);
    }
    return filePath;
  }

  private static resolveEcsPath(
    workspaceFolder: string,
    config: vscode.WorkspaceConfiguration
  ): string {
    return ConfigLoader.resolvePath(
      workspaceFolder,
      config,
      "executablePath",
      "vendor/bin/ecs"
    );
  }

  private static resolveConfigPath(
    workspaceFolder: string,
    config: vscode.WorkspaceConfiguration
  ): string {
    return ConfigLoader.resolvePath(
      workspaceFolder,
      config,
      "configPath",
      "ecs.php"
    );
  }

  private static getExtensionConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("php-ecs-formatter");
  }

  private static getWorkspaceFolder(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error("No workspace folder is open.");
    }

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const folder = vscode.workspace.getWorkspaceFolder(
        activeEditor.document.uri
      );
      if (folder) {
        return folder.uri.fsPath;
      }
    }

    return workspaceFolders[0].uri.fsPath;
  }

  private static getWorkspaceFolderForFile(resource: vscode.Uri): string {
    const folder = vscode.workspace.getWorkspaceFolder(resource);
    if (!folder) {
      vscode.window.showErrorMessage("Workspace folder not found");
      throw new Error("Workspace folder not found");
    }
    return folder.uri.fsPath;
  }
}
