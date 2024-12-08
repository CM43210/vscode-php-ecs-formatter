import * as vscode from "vscode";
import { ConfigLoader } from "../core/ConfigLoader";
import { createEcsCommandRunner } from "../core/EcsCommandRunnerFactory";

export class FormattingProvider
  implements
    vscode.DocumentFormattingEditProvider,
    vscode.DocumentRangeFormattingEditProvider
{
  public async provideDocumentFormattingEdits(
    document: vscode.TextDocument
  ): Promise<vscode.TextEdit[]> {
    try {
      const ecsConfig = ConfigLoader.loadConfigForFile(document.uri);
      const runner = createEcsCommandRunner(ecsConfig);

      const originalContent = document.getText();
      const newContent = await runner.formatContent(originalContent);

      if (newContent !== originalContent) {
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(originalContent.length)
        );
        return [vscode.TextEdit.replace(fullRange, newContent)];
      } else {
        return [];
      }
    } catch (err) {
      if (err instanceof Error) {
        vscode.window.showErrorMessage(err.message);
      }
      return [];
    }
  }

  public async provideDocumentRangeFormattingEdits(
    document: vscode.TextDocument,
    range: vscode.Range
  ): Promise<vscode.TextEdit[]> {
    try {
      let selectedText = document.getText(range);

      let addedPhpTag = false;
      if (!selectedText.trim().startsWith("<?php")) {
        selectedText = "<?php\n" + selectedText;
        addedPhpTag = true;
      }

      const ecsConfig = ConfigLoader.loadConfigForFile(document.uri);
      const runner = createEcsCommandRunner(ecsConfig);

      let newContent = await runner.formatContent(selectedText);

      if (addedPhpTag) {
        newContent = newContent.replace(/^<\?php\s*/, "");
      }

      const originalSelectedText = addedPhpTag
        ? selectedText.replace(/^<\?php\s*/, "")
        : selectedText;

      if (newContent !== originalSelectedText) {
        return [vscode.TextEdit.replace(range, newContent)];
      } else {
        return [];
      }
    } catch (err) {
      if (err instanceof Error) {
        vscode.window.showErrorMessage(err.message);
      }
      return [];
    }
  }
}
