const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const http = require("http");
const morgan = require("morgan");
const socketIo = require("socket.io");


const THRESHOLD = 200;
/**
 * a motion data frame is an object of the form:
 * {
 *    deviceId: "TJVSV",
 *    timeStamp: 1023,
 *    acceleration: {
 *      x: 0,
 *      y: 0,
 *      z: -9.81
 *    }
 *  };
 * the timeStamp is in milliseconds
 */
const motionData = {};
/**
 * a map to save socketId -> deviceId conversions
 */
const socketId_deviceId = {};

const port = process.env.PORT || 4001;

const app = express();

/**
 * CREATE A SERVER OBJECT
 */
const server = http.createServer(app);

/**
 * SERVER CONFIGURATION
 */

// ensure the server can call other domains: enable cross origin resource sharing (cors) 
app.use(cors());

// received packages should be presented in the JSON format
app.use(bodyParser.json());

// show some helpful logs in the commandline
app.use(morgan("dev"));

/**
 * SOCKET CONFIGURATION
 */
// create socket server
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("New client joined: ", socket.id);
  // emit the initial data
  socket.emit("motion_devices", Object.keys(motionData));

  /**
   * remove the motionData of a device on disconnect.  
   */
  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id, socketId_deviceId[socket.id]);
    delete motionData[socketId_deviceId[socket.id]];
    delete socketId_deviceId[socket.id];
    socket.broadcast.emit("motion_devices", Object.keys(motionData));
  });

  socket.on("new_device", data => {
    console.log("register new device: ", data)

    // TODO: registriere das neue device und speichere den
    //       namen in der Map socketId_deviceId.
    //       Teile allen Clients mit, dass ein neues Device
    //       vorhanden ist.
  });

  /**
   * returns all currently active devices
   */
  socket.on("get_devices", () => {
    socket.emit("motion_devices", Object.keys(motionData));
  });

  socket.on("display_device", data => {
    // TODO: verlasse den alten Raum (falls vorhanden)
    //       und schliesse dich dem Raum des neuen display_devices
    //       an
  });

  socket.on("new_motion_data", data => {
    // TODO: Füge die Daten zur entsprechenden Liste hinzu und
    //       teile allen clients im Raum mit, dass neue
    //       Daten vorhanden sind.
    //       Um Fehler zu verhindern, sollte überprüft werden,
    //       ob die Liste auch wirklich existiert.
  });

  socket.on("clear_motion_data", data => {
    // TODO lösche alle aktuellen Daten des devices.
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
