const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

// consts
const DESKTOP_PATH = app.getPath('desktop');
const FOLDER_NAME = 'desktop-folder';
const FOLDER_PATH = path.join(DESKTOP_PATH, FOLDER_NAME);
const EXCLUDED = [FOLDER_NAME];

app.whenReady().then(() => {
  // create interface (should be called when app init)
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadFile('index.html');

  mainWindow.webContents.once('did-finish-load', () => {

    // emit error event via webContents
    const emitErrViaWebContents = (err) => {
      mainWindow.webContents.send('error-occured', JSON.stringify(err));
    };

    // check and create folder (if needed)
    fs.access(FOLDER_PATH, (err) => {
      if (err && err.code === 'ENOENT') {
        fs.mkdir(FOLDER_PATH, (err) => {
          if (err) {
            emitErrViaWebContents(err);
          }
        })
      } else if (err) {
        emitErrViaWebContents(err);
      }
    })    
  })
});

// emit error event via event.reply
const emitErrViaEvent = (event, err) => {
  event.reply('error-occured', JSON.stringify(err));
};

// listen button click
ipcMain.on('clean-desktop', (event) => {

  // get files list
  fs.readdir(DESKTOP_PATH, (err, files) => {
    if (err) {
      emitErrViaEvent(event, err);
    }

    if (!files?.length) {
      return;
    }

    // filter files  
    const filteredFiles = files.filter(item => EXCLUDED.indexOf(item) === -1);

    // replace files
    if (filteredFiles?.length) {
      filteredFiles.forEach(fileName => {
        fs.rename(path.join(DESKTOP_PATH, fileName), path.join(FOLDER_PATH, fileName), (err) => {
          if (err) {
            emitErrViaEvent(event, err);
          }
        })
      })
    }
  }); 
});
