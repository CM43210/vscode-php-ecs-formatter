import { spawn } from "child_process";

export interface ProcessRunner {
  runEcsCheck(
    ecsPath: string,
    configPath: string,
    targetPath: string,
    workspaceRoot: string
  ): Promise<void>;
}

export class DefaultProcessRunner implements ProcessRunner {
  runEcsCheck(
    ecsPath: string,
    configPath: string,
    targetPath: string,
    workspaceRoot: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const processHandle = spawn(
        "php",
        [
          ecsPath,
          "check",
          targetPath,
          "--fix",
          `--config=${configPath}`,
          "--no-progress-bar",
        ],
        { cwd: workspaceRoot }
      );

      let stdoutData = "";
      let stderrData = "";

      processHandle.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      processHandle.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      processHandle.on("error", (err) => {
        reject(err);
      });

      processHandle.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(
              `ECS exited with code ${code}\n` +
                `STDERR:\n${stderrData}\n` +
                `STDOUT:\n${stdoutData}`
            )
          );
        }
      });
    });
  }
}
