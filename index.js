var m = 0;
function motionOn() {
  if (m == 0) {
    document.getElementById("onoroff").innerHTML = "On";
    m = 1;
  } else {
    document.getElementById("onoroff").innerHTML = "Off";
    m = 0;
  }
}

var p = 0;
function pressureOn() {
  if (p == 0) {
    document.getElementById("onoroff1").innerHTML = "On";
    p = 1;
  } else {
    document.getElementById("onoroff1").innerHTML = "Off";
    p = 0;
  }
}

var c = 0;
function cameraOn() {
  if (c == 0) {
    document.getElementById("onoroff2").innerHTML = "On";
    c = 1;
  } else {
    document.getElementById("onoroff2").innerHTML = "Off";
    c = 0;
  }
  sendRequest("camera", c, parseInt($("#camera_mode_data").val()))
}

var d = 0;
function distanceOn() {
  if (d == 0) {
    document.getElementById("onoroff3").innerHTML = "On";
    d = 1;
    //sendRequest("distance", d);
  } else {
    document.getElementById("onoroff3").innerHTML = "Off";
    d = 0;
  }
}

var x = 0;
function changeStyle() {
  if (x == 0) {
    document.getElementById("motionicon").className = "fas fa-check onicon";
    x = 1;
  } else {
    document.getElementById("motionicon").className = "fas fa-times officon";
    x = 0;
  }
}

// var sec = 0;
// var new = false;
// function enableSecurity() {
//     if (sec == 0) {
//         new = true
//         sec = 1
//     } else {
//         new = false
//         sec = 0
//     }

//     while (new) {
//         var getMotionRequest = new XMLHttpRequest();
//         getMotionRequest.open("GET", `http://${window.location.host}/pi_data`, true);
//         getMotionRequest.setRequestHeader("Content-Type", "application/json");
//     }

// }

function appendToLogs(text) {
  $("#log").append("<br>" + $("<div/>").text(text).html());
}

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

function onLoad() {


  function isOpen(ws) {
    return socket.readyState === ws.OPEN;
  }


  var socket = new WebSocket("ws://" + window.location.host + "/ws");
  var img_socket = new WebSocket("ws://" + window.location.host + "/ws_camera_feed");



  socket.onopen = function () {
    socket.send("connected to the SocketServer...");
  };

  socket.onerror = function (error) {
    appendToLogs(`Error: ${error}`);
  };

  socket.onmessage = function (msg, cb) {
    appendToLogs(msg.data);
    if (cb) cb();
  };

  img_socket.onmessage = function (msg) {
    $("#cam").attr("src", "data:image/jpg;base64," + msg.data);
    return false;
  };

  $("form#camera_mode").submit(function (event) {
    if (!isOpen(socket)) {
      appendToLogs("Already closed socket!");
      return false;
    }
    sendRequest("camera", c, $("#camera_mode_data").val())
    return false;
  });

  $("form#disconnect").submit(function (event) {
    if (!isOpen(socket)) {
      appendToLogs("Already closed socket!");
      return false;
    }
    appendToLogs("Disconnected from the server...");
    socket.send("disconnect_request");
    return false;
  });
};