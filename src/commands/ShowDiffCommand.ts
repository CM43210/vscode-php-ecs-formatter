import * as vscode from "vscode";
import * as path from "path";
import { ConfigLoader } from "../core/ConfigLoader";
import { createEcsCommandRunner } from "../core/EcsCommandRunnerFactory";

export class ShowDiffCommand {
  public static async execute(
    context: vscode.ExtensionContext,
    resource?: vscode.Uri
  ): Promise<void> {
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
      const formattedContent = await runner.formatContent(originalContent);

      const originalUri = document.uri;
      const formattedUri = vscode.Uri.parse(
        `ecs-formatted:${document.uri.path}`
      );

      const provider = new (class
        implements vscode.TextDocumentContentProvider
      {
        provideTextDocumentContent(): string {
          return formattedContent;
        }
      })();

      const disposable = vscode.workspace.registerTextDocumentContentProvider(
        "ecs-formatted",
        provider
      );

      context.subscriptions.push(disposable);

      await vscode.commands.executeCommand(
        "vscode.diff",
        originalUri,
        formattedUri,
        `Diff: ${path.basename(document.uri.fsPath)}`,
        { preview: true }
      );

      vscode.workspace.onDidCloseTextDocument((doc) => {
        if (doc.uri.toString() === formattedUri.toString()) {
          disposable.dispose();
        }
      });
    } catch (err) {
      if (err instanceof Error) {
        vscode.window.showErrorMessage(err.message);
      }
    }
  }
}
