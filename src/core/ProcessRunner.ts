import { spawn } from "child_process";
import { dirname } from "path";

export interface ProcessRunner {
  runEcsCheck(
    ecsPath: string,
    configPath: string,
    targetPath: string
  ): Promise<void>;
}

export class DefaultProcessRunner implements ProcessRunner {
  runEcsCheck(
    ecsPath: string,
    configPath: string,
    targetPath: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const process = spawn("php", [
        ecsPath,
        "check",
        targetPath,
        "--fix",
        `--config=${configPath}`,
        "--no-progress-bar",
        "--quiet",
      ], { cwd: dirname(configPath) });

      let stderrData = "";

      process.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      process.on("error", (err) => {
        reject(err);
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ECS exited with code ${code}\n${stderrData}`));
        }
      });
    });
  }
}
