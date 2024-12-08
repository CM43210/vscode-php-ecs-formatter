import * as vscode from "vscode";
import { FixFileCommand } from "./commands/FixFileCommand";
import { ShowDiffCommand } from "./commands/ShowDiffCommand";
import { FormattingProvider } from "./providers/FormattingProvider";
import { ConfigLoader } from "./core/ConfigLoader";

export function activate(context: vscode.ExtensionContext) {
  const fixFileCommand = vscode.commands.registerCommand(
    "php-ecs-formatter.fixFile",
    async (resource?: vscode.Uri) => {
      await FixFileCommand.execute(resource);
    }
  );

  const showDiffCommand = vscode.commands.registerCommand(
    "php-ecs-formatter.showDiff",
    async (resource?: vscode.Uri) => {
      await ShowDiffCommand.execute(context, resource);
    }
  );

  const formattingProvider = new FormattingProvider();

  const formattingProviderRegistration =
    vscode.languages.registerDocumentFormattingEditProvider(
      { language: "php" },
      formattingProvider
    );

  const rangeFormattingProviderRegistration =
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      { language: "php" },
      formattingProvider
    );

  const onSaveDisposable = vscode.workspace.onDidSaveTextDocument(
    async (document: vscode.TextDocument) => {
      if (document.languageId !== "php") {
        return;
      }

      const ecsConfig = ConfigLoader.loadConfigForFile(document.uri);

      if (ecsConfig.onSave) {
        await FixFileCommand.execute(document.uri);
      }
    }
  );

  context.subscriptions.push(
    fixFileCommand,
    showDiffCommand,
    formattingProviderRegistration,
    rangeFormattingProviderRegistration,
    onSaveDisposable
  );
}

export function deactivate() {}
