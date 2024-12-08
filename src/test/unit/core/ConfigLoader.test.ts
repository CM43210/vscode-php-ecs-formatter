import * as vscode from "vscode";
import * as sinon from "sinon";
import * as path from "path";
import * as assert from "assert";
import { ConfigLoader } from "../../../core/ConfigLoader";

suite("ConfigLoader", () => {
  let getConfigurationStub: sinon.SinonStub;
  let workspaceFoldersStub: sinon.SinonStub;
  let activeTextEditorStub: sinon.SinonStub;

  setup(() => {
    getConfigurationStub = sinon.stub(vscode.workspace, "getConfiguration");
    workspaceFoldersStub = sinon.stub(vscode.workspace, "workspaceFolders");
    activeTextEditorStub = sinon.stub(vscode.window, "activeTextEditor");
  });

  teardown(() => {
    sinon.restore();
  });

  suite("loadConfig", () => {
    test("should return default ecsPath and configPath when no settings are provided", () => {
      workspaceFoldersStub.value([{ uri: { fsPath: "/workspace" } }]);
      activeTextEditorStub.value({
        document: {
          uri: { fsPath: "/workspace/file.php" },
        },
      });

      getConfigurationStub.returns({
        get: (key: string, defaultValue: any) => defaultValue,
      });

      const config = ConfigLoader.loadConfig();

      assert.strictEqual(
        config.ecsPath,
        path.join("/workspace", "vendor", "bin", "ecs"),
        "ecsPath should match the default path"
      );
      assert.strictEqual(
        config.configPath,
        path.join("/workspace", "ecs.php"),
        "configPath should match the default path"
      );
      assert.strictEqual(config.onSave, false, "onSave should be false");
    });

    test("should use executablePath from settings if provided", () => {
      workspaceFoldersStub.value([{ uri: { fsPath: "/workspace" } }]);
      activeTextEditorStub.value({
        document: {
          uri: { fsPath: "/workspace/file.php" },
        },
      });

      getConfigurationStub.returns({
        get: (key: string, defaultValue: any) => {
          if (key === "executablePath") {
            return "custom/path/to/ecs";
          }
          return defaultValue;
        },
      });

      const config = ConfigLoader.loadConfig();

      assert.strictEqual(
        config.ecsPath,
        path.join("/workspace", "custom/path/to/ecs"),
        "ecsPath should match the custom path"
      );
    });

    test("should handle absolute executablePath", () => {
      workspaceFoldersStub.value([{ uri: { fsPath: "/workspace" } }]);
      activeTextEditorStub.value({
        document: {
          uri: { fsPath: "/workspace/file.php" },
        },
      });

      getConfigurationStub.returns({
        get: (key: string, defaultValue: any) => {
          if (key === "executablePath") {
            return "/absolute/path/to/ecs";
          }
          return defaultValue;
        },
      });

      const config = ConfigLoader.loadConfig();

      assert.strictEqual(
        config.ecsPath,
        "/absolute/path/to/ecs",
        "ecsPath should match the absolute path"
      );
    });

    test("should use configPath from settings if provided", () => {
      workspaceFoldersStub.value([{ uri: { fsPath: "/workspace" } }]);
      activeTextEditorStub.value({
        document: {
          uri: { fsPath: "/workspace/file.php" },
        },
      });

      getConfigurationStub.returns({
        get: (key: string, defaultValue: any) => {
          if (key === "configPath") {
            return "custom/config/ecs.php";
          }
          return defaultValue;
        },
      });

      const config = ConfigLoader.loadConfig();

      assert.strictEqual(
        config.configPath,
        path.join("/workspace", "custom/config/ecs.php"),
        "configPath should match the relative custom path"
      );
      assert.strictEqual(
        config.ecsPath,
        path.join("/workspace", "vendor", "bin", "ecs"),
        "ecsPath should still be default"
      );
    });

    test("should handle absolute executablePath", () => {
      workspaceFoldersStub.value([{ uri: { fsPath: "/workspace" } }]);
      activeTextEditorStub.value({
        document: {
          uri: { fsPath: "/workspace/file.php" },
        },
      });

      getConfigurationStub.returns({
        get: (key: string, defaultValue: any) => {
          if (key === "executablePath") {
            return "/absolute/path/to/ecs";
          }
          return defaultValue;
        },
      });

      const config = ConfigLoader.loadConfig();

      assert.strictEqual(
        config.ecsPath,
        "/absolute/path/to/ecs",
        "ecsPath should match the absolute path"
      );
    });

    test("should set onSave to true when configured", () => {
      workspaceFoldersStub.value([{ uri: { fsPath: "/workspace" } }]);
      activeTextEditorStub.value({
        document: {
          uri: { fsPath: "/workspace/file.php" },
        },
      });

      getConfigurationStub.returns({
        get: (key: string, defaultValue: any) => {
          if (key === "onsave") {
            return true;
          }
          return defaultValue;
        },
      });

      const config = ConfigLoader.loadConfig();

      assert.strictEqual(config.onSave, true, "onSave should be true");
    });

    test("should throw an error when no workspace is open", () => {
      workspaceFoldersStub.value(undefined);
      activeTextEditorStub.value(undefined);

      assert.throws(
        () => ConfigLoader.loadConfig(),
        /No workspace folder is open/,
        "Should throw an error if no workspace is open"
      );
    });
  });
});
