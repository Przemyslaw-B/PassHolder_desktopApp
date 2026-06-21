const { autoUpdater } = require("electron-updater");
const { app } = require("electron");

autoUpdater.forceDevUpdateConfig = true;

function initUpdater() {
    check();
    setInterval(() => {
        check();
    }, 1000 * 60 * 30);
}

function check() {
    console.log("Checking for updates...");
    console.log("isPackaged:", app.isPackaged);
    console.log("version:", app.getVersion());
    console.log("appPath:", app.getAppPath());
    autoUpdater.checkForUpdates().catch(console.error);
}

autoUpdater.on("checking-for-update", () => {
    console.log("Checking...");
});

autoUpdater.on("update-available", () => {
    console.log("Update available");
});

autoUpdater.on("update-not-available", () => {
    console.log("No updates");
});

autoUpdater.on("download-progress", (progress) => {
    console.log(
        `Downloading: ${Math.round(progress.percent)}%`
    );
});

autoUpdater.on("update-downloaded", () => {
    console.log("Update downloaded");
    forceRestart();
});

autoUpdater.on("error", (err) => {
    console.error("Updater error:", err);
});

function forceRestart() {
    console.log("Restarting application...");
    autoUpdater.quitAndInstall();
}

function getAppVersion() {
    return app.getVersion();
}

module.exports = {initUpdater, getAppVersion};