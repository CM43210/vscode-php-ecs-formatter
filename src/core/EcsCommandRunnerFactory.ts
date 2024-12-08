import { EcsCommandRunner } from "./EcsCommandRunner";
import { EcsConfig } from "./ConfigLoader";
import { DefaultFileHandler, DefaultTempFileProvider } from "./FileHandler";
import { DefaultProcessRunner } from "./ProcessRunner";

export function createEcsCommandRunner(ecsConfig: EcsConfig): EcsCommandRunner {
  const tempFileProvider = new DefaultTempFileProvider();
  const fileHandler = new DefaultFileHandler(tempFileProvider);
  const processRunner = new DefaultProcessRunner();

  return new EcsCommandRunner(ecsConfig, fileHandler, processRunner);
}
