const {ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  const cleanBtn = document.getElementById('cleanButton');
  const errBlock = document.getElementById('errBlock');

  cleanBtn.addEventListener('click', () => {
    errBlock.innerText = '';
    ipcRenderer.send('clean-desktop');
  });

  ipcRenderer.on('error-occured', (_event, err) => {
    errBlock.innerText = err;
  });
})