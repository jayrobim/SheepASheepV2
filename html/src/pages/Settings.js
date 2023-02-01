import { useState } from "react";

const Settings = () => {
  const [newServerURL, setNewServerURL] = useState(window.SERVER_URL);

  return (
    <div className="flex flex-col w-full items-center self-center space-y-4">
      <div className="text-3xl text-center w-full py-5">设置</div>
      <div className="flex space-x-2">
        <label className="text-lg">服务器地址：</label>
        <input
          className="w-60 px-1 border rounded"
          name="server_url_input"
          value={newServerURL}
          onChange={(e) => {
            setNewServerURL(e.target.value);
          }}
        />
        <button
          className="px-5 border border-slate-700 rounded"
          type="button"
          onClick={() => {
            localStorage.setItem("server_url", newServerURL);
            alert("设置已保存，请刷新页面");
          }}
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default Settings;
