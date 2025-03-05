import assert from "assert";
import * as sinon from "sinon";
import { EcsCommandRunner } from "../../../core/EcsCommandRunner";
import {
  DefaultFileHandler,
  DefaultTempFileProvider,
  FileHandler,
  TempFileProvider,
} from "../../../core/FileHandler";
import {
  DefaultProcessRunner,
  ProcessRunner,
} from "../../../core/ProcessRunner";
import { EcsConfig } from "../../../core/ConfigLoader";

suite("EcsCommandRunner", () => {
  let fileHandlerMock: sinon.SinonStubbedInstance<FileHandler>;
  let processRunnerMock: sinon.SinonStubbedInstance<ProcessRunner>;
  let tempFileProviderMock: sinon.SinonStubbedInstance<TempFileProvider>;
  let ecsConfig: EcsConfig;

  setup(() => {
    ecsConfig = {
      ecsPath: "/path/to/ecs",
      configPath: "/path/to/ecs.php",
      onSave: false,
      workspaceRoot: "./",
    };

    tempFileProviderMock = sinon.createStubInstance(DefaultTempFileProvider);
    tempFileProviderMock.getTempDir.returns("/mock/tmp");
    tempFileProviderMock.generateTempFileName.returns("mock_temp.php");

    fileHandlerMock = sinon.createStubInstance(DefaultFileHandler);
    fileHandlerMock.writeTempFile.resolves("/mock/tmp/mock_temp.php");
    fileHandlerMock.readTempFile.resolves("formatted content");
    fileHandlerMock.removeFile.resolves();

    processRunnerMock = sinon.createStubInstance(DefaultProcessRunner);
    processRunnerMock.runEcsCheck.resolves();
  });

  teardown(() => {
    sinon.restore();
  });

  suite("formatContent", () => {
    test("should format content successfully", async () => {
      const runner = new EcsCommandRunner(
        ecsConfig,
        fileHandlerMock,
        processRunnerMock
      );

      const result = await runner.formatContent('<?php echo "Hello"; ?>');

      assert.strictEqual(
        result,
        "formatted content",
        "Should return formatted content"
      );
      assert(
        fileHandlerMock.writeTempFile.calledOnce,
        "Should write temp file once"
      );
      assert(
        fileHandlerMock.readTempFile.calledOnce,
        "Should read temp file once"
      );
      assert(
        fileHandlerMock.removeFile.calledOnce,
        "Should remove temp file once"
      );
      assert(
        processRunnerMock.runEcsCheck.calledOnce,
        "Should run ECS check once"
      );
    });

    test("should throw an error if ECS process fails", async () => {
      processRunnerMock.runEcsCheck.rejects(new Error("ECS error"));
      const runner = new EcsCommandRunner(
        ecsConfig,
        fileHandlerMock,
        processRunnerMock
      );

      await assert.rejects(
        runner.formatContent('<?php echo "Helo"; ?>'),
        /ECS error/,
        "Should throw an error if ECS process fails"
      );

      assert(
        fileHandlerMock.removeFile.calledOnce,
        "Should remove temp file even on error"
      );
    });
  });

  suite("formatFile", () => {
    test("should format file successfully", async () => {
      const runner = new EcsCommandRunner(
        ecsConfig,
        fileHandlerMock,
        processRunnerMock
      );

      await assert.doesNotReject(runner.formatFile("/path/to/file.php"));
      assert(
        processRunnerMock.runEcsCheck.calledOnce,
        "Should run ECS check for file"
      );
    });

    test("should throw an error if ECS process fails for formatFile", async () => {
      processRunnerMock.runEcsCheck.rejects(new Error("ECS failed"));
      const runner = new EcsCommandRunner(
        ecsConfig,
        fileHandlerMock,
        processRunnerMock
      );

      await assert.rejects(
        runner.formatFile("/path/to/file.php"),
        /ECS failed/,
        "Should throw if ECS fails in formatFile"
      );
    });
  });
});
