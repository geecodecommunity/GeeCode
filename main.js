require('update-electron-app')({
    logger: require('electron-log')
});

var CodeApiServer = require("./apiserver/code_api_server_lib");

const path = require('path');
const glob = require('glob');
const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');

console.log(ipcMain)
CodeApiServer.startApiServer(ipcMain);

const debug = /--debug/.test(process.argv[2])

const PY_DIST_FOLDER = 'pydist'
const PY_FOLDER = 'pythonFiles'
const PY_MODULE = 'codehttpserver'

if (process.mas) app.setName('GeeCode')

let mainWindow = null

function initialize() {
    makeSingleInstance()

    loadDemos()

    function startPyServer() {
        // const script = getScriptPath()
        // const pythonExe = getPythonPath()
        // const path = '"' + script + '"'
        //
        // var child_process_num = require("child_process").exec(pythonExe + ' ' + path, {
        //     encoding: 'utf-8'
        // }, (error, stdout, stderr) => {
        //
        // })
        //
        // return child_process_num
    }

    function checkPythonPackaged() {
        const fullPath = path.join(__dirname, PY_DIST_FOLDER)
        return require('fs').existsSync(fullPath)
    }

    function getPythonPath() {
        if (process.platform === 'win32') {
            return 'python'
        }

        return '/usr/local/bin/python3'
    }

    function getScriptPath() {
        if (!checkPythonPackaged()) {
            return path.join(__dirname, PY_FOLDER, PY_MODULE + '.py')

            if (process.platform === 'win32') {
                return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE, PY_MODULE + '.exe')
            }
            return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE)
        }
    }

    function createWindow(subpy) {
        const windowOptions = {
            width: 500,
            minWidth: 360,
            maxWidth: 480,
            height: 720,
            minHeight: 665,
            maximizable: false,
            title: app.setName('GeeCode'),
            icon: path.join(__dirname, '/assets/img/logo2.ico'),
            show: true
        };

        if (process.platform === 'linux') {
            windowOptions.icon = path.join(__dirname, '/assets/img/logo2.ico')
        }

        mainWindow = new BrowserWindow(windowOptions);
        mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

        // mainWindow.loadURL(path.join('file://', __dirname, '/indexPlus.html'));

        // Launch fullscreen with DevTools open, usage: npm run debug
        if (debug) {
            mainWindow.webContents.openDevTools();
            mainWindow.maximize();
            require('devtron').install()
        }

        mainWindow.on('closed', () => {
            mainWindow = null
            // require('child_process').exec('taskkill /f /t /im Code.exe')
            // subpy.kill('SIGNAL')
        });

        ipcMain.on('ClientAutoSearch',function (event) {
            if(mainWindow){
                mainWindow.webContents.send("ClientAutoSearch",event);
            }
        })
    }

    app.on('ready', () => {
        var subpy = startPyServer()
        createWindow(subpy)
    });


    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            var subpy = startPyServer()
            createWindow(subpy)
        }
    })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance() {
    if (process.mas) return;

    var gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // 当运行第二个实例时,将会聚焦到myWindow这个窗口
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore()
                mainWindow.focus()
            }
        })
    }
}

// Require each JS file in the main-process dir
function loadDemos() {
    const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
    files.forEach((file) => {
        require(file)
    })
}

initialize();