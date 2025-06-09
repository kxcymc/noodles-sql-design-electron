const { app, BrowserWindow } = require('electron');
const logger = require('electron-log');
const path = require('path');
// const { exec } = require('child_process');
console.log = logger.log;

const { spawn } = require('child_process');


logger.transports.file.level = 'debug'
logger.transports.file.maxSize = 1002430 // 10M
logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
let date = new Date()
date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
logger.info("程序主进程启动...")

logger.transports.file.resolvePath = () => {
    // exe 路径
    const exeDir = path.dirname(process.execPath);
    return path.join(exeDir, 'main.log');
};

let backendProcess = null; // 存储后端进程引用

// 开发环境路径是注释部分，nodePath不需要
function startBackend() {
    // const backendPath = path.join(__dirname, 'backend/server.js');
    const backendPath = path.join(__dirname, '../backend/server.js');
    const userDataPath = app.getPath('userData');
    // const initSqlPath = path.join(__dirname, 'init.sql');
    const initSqlPath = path.join(__dirname, '../init.sql');
    const nodePath = path.join(__dirname, '../node');

    // backendProcess = exec(
    //     `USER_DATA_PATH="${userDataPath}" INIT_SQL_PATH="${initSqlPath}" node "${backendPath}"`
    // );

    backendProcess = spawn(
        nodePath,
        [backendPath],
        {
            env: {
                ...process.env,  // 保留现有环境变量
                USER_DATA_PATH: userDataPath,
                INIT_SQL_PATH: initSqlPath
            },
            shell: true  // 在 Windows 上使用 shell 执行
        }
    );

    console.log('Database path:', userDataPath);
    console.log('Init SQL path:', initSqlPath);

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.log(`Backend error: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });

    return backendProcess;
}

function stopBackend() {
    if (backendProcess) {
        console.log('Stopping backend process...');
        backendProcess.kill();
        backendProcess = null;
    }
}

async function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
        },
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:8080');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }
}

app.on('window-all-closed', () => {
    stopBackend(); // 关闭所有窗口时停止后端进程
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    stopBackend(); // 应用即将退出时确保停止后端进程
});

app.whenReady().then(() => {
    startBackend();
    createWindow();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});