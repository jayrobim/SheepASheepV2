import { useContext, useEffect, useState } from "react";
import MessageCard from "./MessageCard";
import { SocketContext } from "../App";

const TokenInput = ({ onClick }) => {
  return (
    <div className="flex flex-col w-auto space-y-4">
      <div className="flex flex-col w-auto space-y-4">
        <textarea
          id="token_input"
          placeholder="输入token，然后点击冲"
          className="w-80 h-40 border border-slate-600 p-3"
        />
      </div>
      <div>
        <button
          className="text-lg border border-slate-600 w-20 rounded-lg p-2"
          onClick={onClick}
        >
          冲!
        </button>
      </div>
    </div>
  );
};

const Solver = ({ solverType }) => {
  const [messageList, setMessageList] = useState([]);
  const [socket, connected] = useContext(SocketContext);

  useEffect(() => {
    socket.on("serverError", (err) => {
      console.log(err);
      // setMessageList([]);
    });

    socket.on("solverUpdate", (msg) => {
      if (msg === ">>>CLEAR<<<") {
        setMessageList(() => []);
        return;
      }
      if (msg === ">>>COMPLETED<<<") {
        return;
      }

      setMessageList((messageList) => [
        ...messageList,
        { type: "message", msg },
      ]);
      console.log(msg);
    });

    socket.on("solverError", (msg) => {
      setMessageList((messageList) => [...messageList, { type: "error", msg }]);

      console.error(msg);
    });

    socket.on("solverStarted", () => {
      setMessageList(() => []);
    });
  }, [socket]);

  useEffect(() => {
    if (!connected) {
      setMessageList(() => []);
    }
  }, [connected]);

  const onClick = () => {
    if (!socket.connected) return;
    const token = document.getElementById("token_input").value;
    socket.emit(solverType, token);
    // setMessageList([]);
  };

  return (
    <div className="flex flex-col self-center w-11/12">
      <div className="flex flex-col align-middle items-center w-auto space-y-4">
        <div className="flex flex-col text-3xl py-5">
          {solverType === "challenge" ? "每日挑战" : "今日话题"}自动解题
        </div>
        {!connected && (
          <div className="text-2xl text-red-700">!!!未连接至服务器!!!</div>
        )}
        {connected && <TokenInput onClick={onClick} />}
        {connected && messageList.length !== 0 && (
          <div className="flex flex-col space-y-2 border p-3 rounded-md border-slate-300 overflow-auto w-full md:w-auto max-h-96 bg-zinc-800">
            {messageList.map(({ type, msg }, index) => (
              <MessageCard key={msg + index} msg={msg} type={type} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Solver;
