import { EcsConfig } from "./ConfigLoader";
import { FileHandler } from "./FileHandler";
import { ProcessRunner } from "./ProcessRunner";

export class EcsCommandRunner {
  constructor(
    private ecsConfig: EcsConfig,
    private fileHandler: FileHandler,
    private processRunner: ProcessRunner
  ) {}

  public async formatContent(content: string): Promise<string> {
    const tempFilePath = await this.fileHandler.writeTempFile(content);

    try {
      await this.processRunner.runEcsCheck(
        this.ecsConfig.ecsPath,
        this.ecsConfig.configPath,
        tempFilePath,
        this.ecsConfig.workspaceRoot
      );
      const newContent = await this.fileHandler.readTempFile(tempFilePath);
      return newContent;
    } finally {
      await this.fileHandler.removeFile(tempFilePath);
    }
  }

  public async formatFile(filePath: string): Promise<void> {
    await this.processRunner.runEcsCheck(
      this.ecsConfig.ecsPath,
      this.ecsConfig.configPath,
      filePath,
      this.ecsConfig.workspaceRoot
    );
  }
}
