import { BrowserWindow, app } from "electron";
import path from "node:path";
import { fileURLToPath } from "url";
//#region electron/main.js
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function createWindow() {
	const win = new BrowserWindow({
		width: 1024,
		height: 768,
		icon: path.join(__dirname, "../public/icon.png"),
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	});
	if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
	else win.loadFile(path.join(process.cwd(), "dist/index.html"));
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
//#endregion
