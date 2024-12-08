import { promises as fsPromises } from "fs";
import * as path from "path";

export interface TempFileProvider {
  getTempDir(): string;
  generateTempFileName(): string;
}

export class DefaultTempFileProvider implements TempFileProvider {
  getTempDir(): string {
    return require("os").tmpdir(); 
  }

  generateTempFileName(): string {
    return `ecs_formatter_${Date.now()}.php`;
  }
}

export interface FileHandler {
  writeTempFile(content: string): Promise<string>;
  readTempFile(filePath: string): Promise<string>;
  removeFile(filePath: string): Promise<void>;
}

export class DefaultFileHandler implements FileHandler {
  constructor(private tempFileProvider: TempFileProvider) {}

  async writeTempFile(content: string): Promise<string> {
    const tempDir = this.tempFileProvider.getTempDir();
    const tempFilePath = path.join(tempDir, this.tempFileProvider.generateTempFileName());
    await fsPromises.writeFile(tempFilePath, content);
    return tempFilePath;
  }

  async readTempFile(filePath: string): Promise<string> {
    return fsPromises.readFile(filePath, "utf8");
  }

  async removeFile(filePath: string): Promise<void> {
    await fsPromises.unlink(filePath);
  }
}
