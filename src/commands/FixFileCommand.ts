import * as vscode from "vscode";
import { ConfigLoader } from "../core/ConfigLoader";
import { createEcsCommandRunner } from "../core/EcsCommandRunnerFactory";

export class FixFileCommand {
  public static async execute(resource?: vscode.Uri): Promise<void> {
    let document: vscode.TextDocument;

    if (resource) {
      document = await vscode.workspace.openTextDocument(resource);
    } else {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found");
        return;
      }
      document = editor.document;
    }

    const ecsConfig = ConfigLoader.loadConfigForFile(document.uri);
    const runner = createEcsCommandRunner(ecsConfig);

    try {
      const originalContent = document.getText();
      const newContent = await runner.formatContent(originalContent);

      if (newContent === originalContent) {
        return;
      }

      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(originalContent.length)
      );
      edit.replace(document.uri, fullRange, newContent);
      await vscode.workspace.applyEdit(edit);
      await document.save();
    } catch (err) {
      if (err instanceof Error) {
        vscode.window.showErrorMessage(err.message);
      }
    }
  }
}
