// changes the motion on/off based on switch status
var m = 0;
function motionOn() {
  if (m == 0) {
    document.getElementById("onoroff").innerHTML = "On";
    m = 1;
    sendRequest("motion", m, m); // sends a request to the websocket to say motion is on
  } else {
    document.getElementById("onoroff").innerHTML = "Off";
    m = 0;
    sendRequest("motion", m, m); // sends a request to the websocket to say motion is off
  }
}

// changes the pressure on/off based on switch status
var p = 0;
function pressureOn() {
  if (p == 0) {
    document.getElementById("onoroff1").innerHTML = "On";
    p = 1;
    sendRequest("pressure", p, p); // sends a request to the websocket to say pressure is on
  } else {
    document.getElementById("onoroff1").innerHTML = "Off";
    p = 0;
    sendRequest("pressure", p, p); // sends a request to the websocket to say pressure is off
  }
}

// changes the camera on/off based on switch status
var c = 0;
function cameraOn() {
  if (c == 0) {
    document.getElementById("onoroff2").innerHTML = "On";
    c = 1;
    cameraWindow = window.open("camera_popup"); // opens a new window to display camera page
  } else {
    document.getElementById("onoroff2").innerHTML = "Off";
    c = 0;
    document.getElementById("cameraicon").className = "fas fa-times officon";
    cameraWindow.close(); // closes that window when switch is off
  }
  sendRequest("camera", c, 0); // sends a request to the websocket to say camera is on
}

// changes the distance on/off based on switch statius
var d = 0;
function distanceOn() {
  if (d == 0) {
    document.getElementById("onoroff3").innerHTML = "On";
    d = 1;
    sendRequest("distance", d, d); // sends a request to the websocket to say distance is on
  } else {
    document.getElementById("onoroff3").innerHTML = "Off";
    d = 0;
    sendRequest("distance", d, d); // sends a request to the websocket to say distance is off
  }
}

// logs the information/detection of each of the sensors
function appendToLogs(text) {
  // camera log which changes the check or cross based on detection
  if (text.includes("camera")) {
    if (text.includes("1") || text.includes("Motion detected")) {
      document.getElementById("cameraicon").className = "fas fa-check onicon";
    } else {
      document.getElementById("cameraicon").className = "fas fa-times officon";
    }
  }
  // distance log which changes the check or cross based on detection
  if (text.includes("distance")) {
    if (text.includes("Disturbance detected")) {
      document.getElementById("distanceicon").className = "fas fa-check onicon";
    } else {
      document.getElementById("distanceicon").className =
        "fas fa-times officon";
    }
  }
  // pressure log which changes the check or cross based on detection
  if (text.includes("pressure")) {
    if (text.incldues("Pressure not detected")) {
      document.getElementById("pressureicon").className = "fas fa-check onicon";
    } else {
      document.getElementById("pressureicon").className =
        "fas fa-times officon";
    }
  }
  // motion log which changes the check or cross based on detection
  if (text.includes("motion")) {
    if (text.includes("Motion detected")) {
      document.getElementById("motionicon").className = "fas fa-check onicon";
    } else {
      document.getElementById("motionicon").className = "fas fa-times officon";
    }
  }
  // creates the new log which is displayed here
  $("#log").append("<br>" + $("<div/>").text(text).html());
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

// runs on load of the html page
function onLoad() {
  // opens websocket
  function isOpen(ws) {
    return socket.readyState === ws.OPEN;
  }

  // sets websocket host and location
  var socket = new WebSocket("ws://" + window.location.host + "/ws");
  var img_socket = new WebSocket(
    "ws://" + window.location.host + "/ws_camera_feed"
  );

  // when websocket connected, prints statement in log
  socket.onopen = function () {
    socket.send("connected to the SocketServer...");
  };

  // if error than display statement in log
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
