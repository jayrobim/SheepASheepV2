const spawn = require("child_process").spawn;
const { Server } = require("socket.io");

const spawnSolverProcess = (type, token, socket) => {
  const solverProcess = spawn("node", [`${type}.js`, "-t", token]);
  socket.data[`${type}Started`] = true;
  solverProcess.stdout.on("data", (data) => {
    const outputs = data
      .toString()
      .split(/\r?\n/)
      .filter((e) => e);

    for (line of outputs) {
      socket.emit("solverUpdate", line);
    }
  });

  solverProcess.stderr.on("data", (data) => {
    socket.emit("solverError", data.toString());
  });

  solverProcess.on("exit", () => {
    socket.data[`${type}Started`] = false;
    console.log("solver process exited");
  });

  return solverProcess;
};

const io = new Server(3500, {
  cors: {
    origin: "*",
    credentials: false,
  },
});

io.on("connection", (socket) => {
  // ...
  console.log(socket.id, "connected");

  socket.on("disconnecting", () => {
    console.log("client disconnecting");
    console.log("killing solver processes");
    if (socket.data.challenge_started) {
      socket.data.challenge_process.kill();
    }
  });

  socket.on("challenge", (ylgyToken) => {
    if (!socket.data.challengeStarted) {
      console.log("id:", socket.id, "started challenge solver");
      const challenge_process = spawnSolverProcess(
        "challenge",
        ylgyToken,
        socket
      );
      socket.data.challenge_process = challenge_process;
      socket.emit("solverStarted", null)
    } else {
      socket.emit(
        "serverError",
        { type: "1", msg: "Challenge solver already started" }
      );
    }
  });

  socket.on("topic", (ylgyToken) => {
    if (!socket.data.topicStarted) {
      console.log("socket.id:", socket.id, "started topic solver");
      const topic_process = spawnSolverProcess("topic", ylgyToken, socket);
      socket.data.topic_process = topic_process;
      socket.emit("solverStarted", null)
    } else {
      JSON.stringify({ type: "1", msg: "Topic solver already started" })
    }
  });
});
