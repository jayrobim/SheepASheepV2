const DEFAULT_SERVER_URL = "http://localhost:3500";

if (!localStorage.getItem("server_url")) {
  localStorage.setItem("server_url", DEFAULT_SERVER_URL);
}

window.SERVER_URL = localStorage.getItem("server_url");
