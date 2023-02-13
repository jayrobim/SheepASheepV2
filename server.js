const spawn = require("child_process").spawn;
const {Server} = require("socket.io");

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
    let ip = "";
    if (socket.handshake.headers['x-forwarded-for'] != null) {
        ip = socket.handshake.headers['x-forwarded-for'];
    } else {
        ip = socket.handshake.address;
    }
    printLog(ip, socket.id, "connected")

    socket.on("disconnecting", () => {
        printLog(ip, socket.id, "client disconnecting")
        printLog(ip, socket.id, "killing solver processes")
        if (socket.data.challenge_started) {
            socket.data.challenge_process.kill();
        }
    });

    socket.on("challenge", (ylgyToken) => {
        if (!socket.data.challengeStarted) {
            printLog(ip, socket.id, "started challenge solver")
            socket.data.challenge_process = spawnSolverProcess(
                "challenge",
                ylgyToken,
                socket
            );
            socket.emit("solverStarted", null)
        } else {
            socket.emit(
                "serverError",
                {type: "1", msg: "Challenge solver already started"}
            );
        }
    });

    socket.on("topic", (ylgyToken) => {
        if (!socket.data.topicStarted) {
            printLog(ip, socket.id, "started topic solver")
            socket.data.topic_process = spawnSolverProcess("topic", ylgyToken, socket);
            socket.emit("solverStarted", null)
        } else {
            JSON.stringify({type: "1", msg: "Topic solver already started"})
        }
    });
});

const printLog = (ip, id, msg) => {
    console.log("ip:", ip, "id:", id, msg)
}
