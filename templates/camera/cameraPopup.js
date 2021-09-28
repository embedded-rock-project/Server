//all varun just commenting -D
//formatting json commands for camera and toggle for different camera modes.
// makes camera to forward a mode
var b = 0;
var c = 1;
function backOneMode() {
  if (b != 0) {
    b = b - 1;
    document.getElementById("test").innerHTML = b;
    sendRequest("camera", c, b);
  }
}

// makes camera go back a mode
function nextOneMode() {
  if (b != 2) {
    b = b + 1;
    document.getElementById("test").innerHTML = b;
    sendRequest("camera", c, b);
  }
}

// sends request through the http request to get data to the python files and back
function sendRequest(sensorType, isSensorOn, dataByte) {
  var newRequest = new XMLHttpRequest();
  newRequest.open("POST", `http://${window.location.host}/pi_data`, true);
  newRequest.setRequestHeader("Content-Type", "application/json");
  newRequest.send(
    JSON.stringify({
      sensor: sensorType,
      isSensorOn: isSensorOn,
      mode: dataByte,
    })
  );
}

// creates the new log which is displayed here
function appendToLogs(text) {
  $("#log").append("<br>" + $("<div/>").text(text).html());
}

// runs on load of the html page
function onLoad() {
  // opens websocket
  function isOpen(ws) {
    return socket.readyState === ws.OPEN;
  }
  //connecting to camera using websocket
  var socket = new WebSocket("ws://" + window.location.host + "/ws");
  var img_socket = new WebSocket(
    "ws://" + window.location.host + "/ws_camera_feed"
  );

  // when websocket connected, prints statement in log
  socket.onopen = function () {
    socket.send("connected to the SocketServer...");
  };
  //error message + log handling
  socket.onerror = function (error) {
    appendToLogs(`Error: ${error}`);
  };

  // message displayed on log after sensor detects something
  socket.onmessage = function (msg, cb) {
    appendToLogs(msg.data);
    if (cb) cb();
  };

  // camera log statement
  img_socket.onmessage = function (msg) {
    $("#cam").attr("src", "data:image/jpg;base64," + msg.data);
    return false;
  };

  // displayed when camera mode switched
  $("form#camera_mode").submit(function (event) {
    if (!isOpen(socket)) {
      appendToLogs("Already closed socket!");
      return false;
    }
    sendRequest("camera", c, $("#camera_mode_data").val());
    return false;
  });

  // displayed when client disconnected from websocket
  $("form#disconnect").submit(function (event) {
    if (!isOpen(socket)) {
      appendToLogs("Already closed socket!");
      return false;
    }
    appendToLogs("Disconnected from the server...");
    socket.send("disconnect_request");
    return false;
  });
}
