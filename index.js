const { delay } = require("./utils/helpers");
const spawn = require("child_process").spawn;

const spawnSolverProcess = (type, id, token) => {
  return new Promise((resolve) => {
    const solverProcess = spawn("node", [`${type}.js`, "-t", token]);
    solverProcess.stdout.on("data", (data) => {
      const outputs = data
        .toString()
        .split(/\r?\n/)
        .filter((e) => e);

      for (line of outputs) {
        if (line === ">>>CLEAR<<<") {
          console.clear();
          console.log(
            "正在执行",
            id,
            type === "topic" ? "每日话题" : "每日挑战"
          );
          continue;
        } else if (line === ">>>COMPLETED<<<") {
          console.clear();
          console.log(
            id,
            type === "topic" ? "每日话题" : "每日挑战",
            "执行完毕"
          );
          continue;
        }
        console.log(line);
      }
    });

    solverProcess.stderr.on("data", (data) => {
      console.log(data.toString());
    });

    solverProcess.on("exit", () => {
      console.log(id, type === "topic" ? "每日话题" : "每日挑战", "执行完毕");
      resolve();
    });
  });
};

const main = async () => {
  console.log("正在读取 tokens.json");
  const tokens = require("./tokens.json");

  for (id in tokens) {
    console.log("=========================");
    console.log("开始", id, "的每日挑战");
    console.log("=========================");
    await spawnSolverProcess("challenge", id, tokens[id]);
    await delay(3);

    console.log("=========================");
    console.log("开始", id, "的每日话题");
    console.log("=========================");
    await spawnSolverProcess("topic", id, tokens[id]);
    await delay(3);
  }
};

main();
