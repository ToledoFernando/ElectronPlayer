const { webContents, ipcMain, Notification } = require("electron");
const path = require("path");
const ytdl = require("ytdl-core");
const fs = require("fs");
// const axios = require("axios");
const https = require("https");

function musicFolder() {
  ipcMain.handle("musicFolder", async (event, url) => {
    let directory;
    if (url) {
      let ruta = "\\";
      url?.forEach((element) => {
        ruta += `${element}\\`;
      });
      directory = `C:\\Users\\${process.env.USERNAME}\\Music\\${ruta}`;
    } else {
      directory = `C:\\Users\\${process.env.USERNAME}\\Music\\`;
    }
    const data = fs.readdirSync(`${directory}`);

    let mp3File = [];
    let folders = [];

    await Promise.all(
      data.map(async (file) => {
        try {
          const data = await fs.promises.stat(path.join(directory, file));
          if (data.isDirectory()) {
            folders.push({ name: file });
          } else if (path.extname(`${directory}\\${file}`) === ".mp3") {
            mp3File.push({ name: file });
          }
        } catch (err) {
          console.log(err.message);
        }
      })
    );

    for (let a = 0; a < mp3File.length; a++) {
      const buff = fs.readFileSync(path.join(directory, mp3File[a].name));
      mp3File[a].buff = buff;
    }

    return { mp3File, folders };
  });
}

function getInfoMusic() {
  ipcMain.handle("getMusicInfo", async (event, ruta) => {
    console.log("BUSCANDO");
    const data = await ytdl.getInfo(ruta);
    let response = { title: data.player_response.videoDetails.title };
    for (let a = 0; a < data.formats.length; a++) {
      if (
        data.formats[a].qualityLabel !== null &&
        data.formats[a].hasAudio &&
        data.formats[a].hasVideo
      ) {
        response.url = data.formats[a].url;
        return response;
      }
    }
  });
}

function downloadVideoURL(ruta) {
  const file = fs.createWriteStream(
    `C:\\Users\\${process.env.USERNAME}\\Video\\${ruta.title}.mp4`
  );

  https.get(ruta.url, (response) => {
    const totalLength = response.headers["content-length"];

    response.on("data", (chunk) => {
      file.write(chunk);
      const downloaded = file.bytesWritten;
      const progress = Math.round((downloaded / totalLength) * 10000) / 100;
      console.log(`Downloaded ${progress}%`);
      webContents.getAllWebContents().forEach((webContent) => {
        webContent.send("newProgress", progress);
      });
    });

    response.on("end", () => {
      file.end();
      new Notification({
        title: "Descarga Completa",
        body: ruta.title,
      }).show();
      console.log("Download finished");
    });
  });
}

function downloadMusicUrl(ruta) {
  const name = ruta.title.replace(/[^a-zA-Z0-9]/g, " ");
  const file = fs.createWriteStream(
    `C:\\Users\\${process.env.USERNAME}\\Music\\${name}.mp3`
  );
  console.log(file);
  console.log("######################3");
  console.log("DESCARGANDO MUSICA");
  https.get(ruta.url, (response) => {
    const totalLength = response.headers["content-length"];

    response.on("data", (chunk) => {
      file.write(chunk);
      const downloaded = file.bytesWritten;
      const progress = Math.round((downloaded / totalLength) * 10000) / 100;
      console.log(`Downloaded ${progress}%`);
      webContents.getAllWebContents().forEach((webContent) => {
        webContent.send("newProgress", progress);
      });
    });

    response.on("end", () => {
      file.end();
      new Notification({
        title: "Descarga Completa",
        body: ruta.title,
      }).show();
      console.log("Download finished");
    });
  });
}

module.exports = {
  musicFolder,
  getInfoMusic,
  downloadVideoURL,
  downloadMusicUrl,
};