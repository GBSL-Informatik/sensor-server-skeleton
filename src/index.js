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
 * @return [Array<string>] all currently active deviceIds
 */
function deviceIds() {
  return Object.keys(motionData);
}


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

    // TODO 1: registriere das neue device indem du:
    //          - in der Variable 'motionData' für die deviceId eine leere Liste anlegst:
    //              motionData[data.deviceId] = []
    //          - in der Variable 'socketId_deviceId' für die socketId (socker.id)
    //              die deviceId (data.deviceId) speicherst. Diese map wird benötigt, um
    //              beim schliessen der Verbindung allen sockets, die diesem Raum angehören,
    //              mitzuteilen, dass keine Daten mehr zu erwarten sind...
    // TODO 2: allen Socket-Clients dieses Servers mitteilen, dass ein neues Device vorhanden ist:
    //            Nachricht 'motion_devices', Daten: deviceIds()
  });

  /**
   * returns all currently active devices
   */
  socket.on("get_devices", () => {
    socket.emit("motion_devices", deviceIds());
  });

  socket.on("new_motion_data", data => {
    // TODO 1: Füge die Daten zur entsprechenden Liste (motionData[data.deviceId]) hinzu.
    //         Schaue im wordcloud Beispiel nach, wie Daten einer Liste hinzugefügt werden können.
    // TODO 2: Schicke allen Sockets, welche im Raum 'data.deviceId' sind, die neuen Daten:
    //         Nachricht "motion_data", Daten: motionData[data.deviceId]
    // OPTIONAL 1: Um Fehler zu verhindern, sollte überprüft werden, 
    //             dass die Liste motionData[data.deviceId] auch wirklich existiert.
    // OPTIONAL 2: Es sollen maximal 200 motionData Werte pro deviceId gespeichert gespeichert werden.
    //             - Sind noch nicht 200 Werte vorhanden - neuer Wert (hinten) hinzufügen
    //             - Sind bereits 200 Werte vorhanden: Erster Wert der Liste entfernen (https://github.com/GBSL-Informatik/knowledgebase/wiki/Whats-the-equivalent-of-XYZ-of-Python-in-JavaScript#javascript-4), 
    //               und neuen Wert hinten anfügen.
  });

  socket.on("display_device", data => {
    // TODO 1: verlasse den alten Raum (data.oldDeviceId)
    // TODO 2: trete dem neuen Raum (data.deviceId) bei
    // TODO 3: schicke die aktuellen motionDatas dieses Raumes an den Socket
    //         Nachricht: "motion_data", Daten: motionData[data.deviceId]
  });


  socket.on("clear_motion_data", data => {
    // TODO 1: lösche alle aktuellen Daten des devices (motionData[data.deviceId] auf leere Liste [] setzen).
    // TODO 2: allen Sockets im Raum data.deviceId die aktuellen Daten (=leere Liste) schicken:
    //         Nachricht: "motion_data", Daten: []
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
