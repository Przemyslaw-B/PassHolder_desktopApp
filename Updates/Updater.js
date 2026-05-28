const { autoUpdater } = require("electron-updater");
const { app } = require("electron");

function initUpdater() {
    check();
    setInterval(() => {
        check();
    }, 1000 * 60 * 30);
}

function check() {
    console.log("Checking for updates...");
    autoUpdater.checkForUpdates();
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
    setTimeout(() => {
        autoUpdater.quitAndInstall(
            false,
            true
        );
    }, 1000*60*30);
}

function getAppVersion() {
    return app.getVersion();
}

module.exports = {initUpdater, getAppVersion};