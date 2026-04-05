const { app, BrowserWindow, Menu, Tray, nativeImage, shell, dialog, Notification } = require("electron")
const path = require("path")
const http = require("http")
const { spawn } = require("child_process")
const { autoUpdater } = require("electron-updater")

const pkg = require(path.join(__dirname, "..", "package.json"))
const APP_NAME = "COSPACEX"
const APP_VERSION = pkg.version || "2.1.0"

if (process.platform === "win32") {
    app.setAppUserModelId("com.smartlog.cospacex")
}

// Configure auto-updater
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

const isDev = process.env.NODE_ENV === "development"
const PORT = 3001
const NEXT_URL = `http://localhost:${PORT}`

let mainWindow = null
let tray = null
let nextServer = null

/** Wait until Next.js responds — uses Node http only (no extra deps; works inside app.asar). */
function waitForHttpServer(urlStr, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        const start = Date.now()
        const poll = () => {
            const u = new URL(urlStr)
            const port = u.port ? Number(u.port) : (u.protocol === "https:" ? 443 : 80)
            const req = http.request(
                {
                    hostname: u.hostname,
                    port,
                    path: u.pathname || "/",
                    method: "GET",
                    timeout: 2500,
                },
                (res) => {
                    res.resume()
                    resolve()
                }
            )
            req.on("error", () => {
                if (Date.now() - start >= timeoutMs) {
                    reject(new Error(`Timeout waiting for ${urlStr}`))
                } else {
                    setTimeout(poll, 350)
                }
            })
            req.on("timeout", () => {
                req.destroy()
                if (Date.now() - start >= timeoutMs) {
                    reject(new Error(`Timeout waiting for ${urlStr}`))
                } else {
                    setTimeout(poll, 350)
                }
            })
            req.end()
        }
        poll()
    })
}

// ─── App root (packaged: must be a real directory — not app.asar, or spawn cwd → ENOTDIR)
function getAppRoot() {
    if (isDev) return path.join(__dirname, "..")
    if (app.isPackaged) return app.getAppPath()
    return path.join(__dirname, "..")
}

// ─── Start Next.js server ───────────────────────────────────────
function startNextServer() {
    if (isDev) return Promise.resolve() // dev mode: Next.js already running

    return new Promise((resolve, reject) => {
        const appDir = getAppRoot()
        const nextBin = path.join(appDir, "node_modules", "next", "dist", "bin", "next")

        nextServer = spawn(process.execPath, [nextBin, "start", "--port", String(PORT)], {
            cwd: appDir,
            env: {
                ...process.env,
                NODE_ENV: "production",
                PORT: String(PORT),
                ELECTRON_RUN_AS_NODE: "1",
            },
            stdio: ["ignore", "pipe", "pipe"],
        })

        nextServer.stdout.on("data", data => {
            console.log("[Next.js]", data.toString().trim())
        })

        nextServer.stderr.on("data", data => {
            console.error("[Next.js err]", data.toString().trim())
        })

        nextServer.on("error", reject)

        waitForHttpServer(NEXT_URL, 60000)
            .then(resolve)
            .catch(reject)
    })
}

// ─── Create Main Window ─────────────────────────────────────────
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: APP_NAME,
        titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
        backgroundColor: "#060C1A",
        icon: path.join(__dirname, "assets", "icon.png"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: isDev,
        },
        show: false,
    })

    mainWindow.loadURL(NEXT_URL)

    mainWindow.once("ready-to-show", () => {
        mainWindow.show()
        if (isDev) mainWindow.webContents.openDevTools({ mode: "detach" })
    })

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (!url.startsWith(NEXT_URL)) {
            shell.openExternal(url)
            return { action: "deny" }
        }
        return { action: "allow" }
    })

    mainWindow.on("closed", () => { mainWindow = null })
}

// ─── System Tray ───────────────────────────────────────────────
function createTray() {
    try {
        const trayIcon = nativeImage.createFromPath(path.join(__dirname, "assets", "tray-icon.png"))
        tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

        const contextMenu = Menu.buildFromTemplate([
            { label: APP_NAME, enabled: false },
            { type: "separator" },
            { label: "Show App", click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus() } else { createWindow() } } },
            { label: "New Deal", click: () => { if (mainWindow) { mainWindow.show(); mainWindow.loadURL(`${NEXT_URL}/deals`) } } },
            { label: "Expert Panel", click: () => { if (mainWindow) { mainWindow.show(); mainWindow.loadURL(`${NEXT_URL}/chat`) } } },
            { type: "separator" },
            { label: `Quit ${APP_NAME}`, click: () => { app.quit() } },
        ])

        tray.setToolTip(`${APP_NAME} — SC&L Expert Workspace`)
        tray.setContextMenu(contextMenu)
        tray.on("click", () => { if (mainWindow) { mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show() } })
    } catch {
        console.log("Tray icon not found, skipping tray")
    }
}

// ─── App Menu ──────────────────────────────────────────────────
function createMenu() {
    const template = [
        {
            label: APP_NAME,
            submenu: [
                {
                    label: `About ${APP_NAME}`,
                    click: () => {
                        dialog.showMessageBox({
                            title: APP_NAME,
                            message: `${APP_NAME} v${APP_VERSION}\nSC&L Expert Workspace\n\nPowered by Gemini AI`,
                            detail: "Professional presale support for Supply Chain & Logistics teams.",
                        })
                    },
                },
                { type: "separator" },
                { role: "quit" },
            ],
        },
        {
            label: "View",
            submenu: [
                { label: "Dashboard", click: () => mainWindow?.loadURL(`${NEXT_URL}/`) },
                { label: "Expert Panel", click: () => mainWindow?.loadURL(`${NEXT_URL}/chat`) },
                { label: "Proposals", click: () => mainWindow?.loadURL(`${NEXT_URL}/proposals`) },
                { label: "Deals", click: () => mainWindow?.loadURL(`${NEXT_URL}/deals`) },
                { label: "Skills", click: () => mainWindow?.loadURL(`${NEXT_URL}/skills`) },
                { label: "Knowledge Base", click: () => mainWindow?.loadURL(`${NEXT_URL}/knowledge`) },
                { label: "System health", click: () => mainWindow?.loadURL(`${NEXT_URL}/health`) },
                { type: "separator" },
                { role: "reload" },
                { role: "toggleDevTools" },
                { role: "togglefullscreen" },
            ],
        },
        {
            label: "Window",
            submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
        },
    ]

    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ─── Auto-Update Events ────────────────────────────────────────
function setupAutoUpdater() {
    if (isDev) return

    autoUpdater.on("checking-for-update", () => {
        console.log("[AutoUpdate] Checking for update...")
    })

    autoUpdater.on("update-available", (info) => {
        console.log("[AutoUpdate] Update available:", info.version)
        if (Notification.isSupported()) {
            new Notification({
                title: `${APP_NAME} update available`,
                body: `Version ${info.version} is downloading in the background...`,
                icon: path.join(__dirname, "assets", "icon.png"),
            }).show()
        }
    })

    autoUpdater.on("update-not-available", () => {
        console.log("[AutoUpdate] App is up to date.")
    })

    autoUpdater.on("update-downloaded", (info) => {
        console.log("[AutoUpdate] Update downloaded:", info.version)
        const response = dialog.showMessageBoxSync(mainWindow, {
            type: "info",
            title: `Update ready — ${APP_NAME}`,
            message: `Version ${info.version} is ready to install.`,
            detail: "Restart now to apply the update, or wait until next launch.",
            buttons: ["Restart Now", "Later"],
            defaultId: 0,
        })
        if (response === 0) {
            autoUpdater.quitAndInstall()
        }
    })

    autoUpdater.on("error", (err) => {
        console.error("[AutoUpdate] Error:", err.message)
    })

    setTimeout(() => {
        autoUpdater.checkForUpdates().catch(err => {
            console.log("[AutoUpdate] Could not check:", err.message)
        })
    }, 5000)
}

// ─── App Events ────────────────────────────────────────────────
app.whenReady().then(async () => {
    try {
        console.log(`Starting ${APP_NAME}...`)
        await startNextServer()
        createWindow()
        createTray()
        createMenu()
        setupAutoUpdater()
    } catch (err) {
        console.error("Failed to start:", err)
        dialog.showErrorBox(`${APP_NAME} error`, `Failed to start: ${err.message}`)
        app.quit()
    }
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})

app.on("activate", () => {
    if (!mainWindow) createWindow()
})

app.on("quit", () => {
    if (nextServer) {
        console.log("Stopping Next.js server...")
        nextServer.kill()
    }
})
