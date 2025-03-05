import * as assert from "assert";
import * as sinon from "sinon";
import { DefaultProcessRunner } from "../../../core/ProcessRunner";

suite("DefaultProcessRunner", () => {
  let spawnStub: sinon.SinonStub;

  setup(() => {
    spawnStub = sinon.stub(require("child_process"), "spawn");
  });

  teardown(() => {
    sinon.restore();
  });

  test("should spawn php process with correct arguments and cwd", async () => {
    const fakeChildProcess = {
      stdout: { on: sinon.stub() },
      stderr: { on: sinon.stub() },
      on: sinon.stub(),
    };
    spawnStub.returns(fakeChildProcess);

    fakeChildProcess.on.withArgs("close").yields(0);

    const runner = new DefaultProcessRunner();

    await runner.runEcsCheck(
      "/path/to/ecs",
      "/path/to/ecs.php",
      "/some/target.php",
      "/my/workspace/root"
    );

    assert.strictEqual(spawnStub.callCount, 1, "spawn should be called once");

    const [command, args, options] = spawnStub.firstCall.args;

    assert.strictEqual(command, "php", "Should call php");

    assert.deepStrictEqual(
      args,
      [
        "/path/to/ecs",
        "check",
        "/some/target.php",
        "--fix",
        "--config=/path/to/ecs.php",
        "--no-progress-bar",
      ],
      "Should pass correct arguments to ECS"
    );

    assert.strictEqual(
      options.cwd,
      "/my/workspace/root",
      "Should use the workspaceRoot as cwd"
    );
  });

  test("should resolve if exit code is 0", async () => {
    const fakeChildProcess = {
      stdout: { on: sinon.stub() },
      stderr: { on: sinon.stub() },
      on: sinon.stub(),
    };
    spawnStub.returns(fakeChildProcess);

    fakeChildProcess.on.withArgs("close").yields(0);

    const runner = new DefaultProcessRunner();
    await assert.doesNotReject(
      runner.runEcsCheck(
        "/path/to/ecs",
        "/path/to/ecs.php",
        "file.php",
        "/my/ws"
      )
    );
  });

  test("should reject if exit code is non-zero", async () => {
    const fakeChildProcess = {
      stdout: { on: sinon.stub() },
      stderr: { on: sinon.stub() },
      on: sinon.stub(),
    };
    spawnStub.returns(fakeChildProcess);

    fakeChildProcess.stdout.on
      .withArgs("data")
      .callsArgWith(1, Buffer.from("Some ECS output"));
    fakeChildProcess.stderr.on
      .withArgs("data")
      .callsArgWith(1, Buffer.from("Some ECS error"));

    fakeChildProcess.on.withArgs("close").yields(1);

    const runner = new DefaultProcessRunner();

    await assert.rejects(
      runner.runEcsCheck(
        "/path/to/ecs",
        "/path/to/ecs.php",
        "file.php",
        "/my/ws"
      ),
      /ECS exited with code 1\nSTDERR:\nSome ECS error\nSTDOUT:\nSome ECS output/
    );
  });

  test("should reject on process error event", async () => {
    const fakeChildProcess = {
      stdout: { on: sinon.stub() },
      stderr: { on: sinon.stub() },
      on: sinon.stub(),
    };
    spawnStub.returns(fakeChildProcess);

    const testError = new Error("Spawn error");
    fakeChildProcess.on.withArgs("error").yields(testError);

    const runner = new DefaultProcessRunner();
    await assert.rejects(
      runner.runEcsCheck(
        "/path/to/ecs",
        "/path/to/ecs.php",
        "file.php",
        "/my/ws"
      ),
      /Spawn error/
    );
  });
});
