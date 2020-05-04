import App from "./app";
import path from "path";

const app = new App(path.resolve(__dirname));

app.startApp();