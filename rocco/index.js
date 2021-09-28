function functionName( func )
{
    var result = /^function\s+([\w\$]+)\s*\(/.exec( func.toString() )
    return  result  ?  result[ 1 ]  :  '' // for an anonymous function there won't be a match
}

function changeStyle(elementName, isEnabled) {
  console.trace(functionName(changeStyle))
  if (isEnabled) {
    document.getElementById(elementName).className = "fas fa-check onicon";
  } else {
    document.getElementById(elementName).className = "fas fa-times officon";
  }
}

function toggleElement(elementName, value) {
  console.trace(functionName(toggleElement))
  document.getElementById(elementName).innerHTML = value;

}

function appendToLogs(text) {
  $("#log").append("<br>" + $("<div/>").text(text).html());
  $("#log").scrollTop = $("#log").scrollHeight;
}

function sendRequest(sensorType, isSensorOn, dataByte) {
  console.trace(functionName(sendRequest))
  var newRequest = new XMLHttpRequest();
  newRequest.open("POST", `https://${window.location.host}/pi_data`, true);
  newRequest.setRequestHeader("Content-Type", "application/json");
  newRequest.send(
    JSON.stringify({
      sensor: sensorType,
      isSensorOn: Boolean(isSensorOn),
      mode: dataByte,
    })
  );
}



var m = 0;
function motionOn() {
  console.trace(functionName(motionOn))
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
  console.trace(functionName(pressureOn))
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
  console.trace(functionName(cameraOn))
  if (!c) {
    document.getElementById("onoroff2").innerHTML = "On";
  } else {
    document.getElementById("onoroff2").innerHTML = "Off";
  }
  c = !c
  
  sendRequest("camera", c, parseInt($("#camera_mode_data").val()))
  changeStyle("cameraicon", c)
}

var d = 0;
function distanceOn() {
  console.trace(functionName(distanceOn))
  if (d == 0) {
    document.getElementById("onoroff3").innerHTML = "On";
    d = 1;
    //sendRequest("distance", d);
  } else {
    document.getElementById("onoroff3").innerHTML = "Off";
    d = 0;
  }
}


function onLoad() {
  console.trace(functionName(onLoad))

  function isOpen(ws) {
    console.trace(functionName(isOpen))
    return socket.readyState === ws.OPEN;
  }


  var socket = new WebSocket("wss://" + window.location.host + "/ws");
  var img_socket = new WebSocket("wss://" + window.location.host + "/ws_camera_feed");



  socket.onopen = function () {
    console.trace(functionName(socket.onopen))
    socket.send("connected to the SocketServer...");
  };

  socket.onerror = function (error) {
    console.trace(functionName(socket.onerror))
    appendToLogs(`Error: ${error}`);
  };

  socket.onmessage = function (msg, cb) {
    console.trace(functionName(socket.onmessage))
    appendToLogs(msg.data);
    if (cb) cb();
  };

  img_socket.onmessage = function (msg) {
    $("#cam").attr("src", "data:image/jpg;base64," + msg.data);
    return false;
  };

  $("form#camera_mode").submit(function (event) {
    console.trace(functionName("camera mode"))
    if (!isOpen(socket)) {
      appendToLogs("Already closed socket!");
      return false;
    }
    sendRequest("camera", c, parseInt($("#camera_mode_data").val()))
    return false;
  });

  $("form#disconnect").submit(function (event) {
    console.trace(functionName("disconnect"))
    if (!isOpen(socket)) {
      appendToLogs("Already closed socket!");
      return false;
    }
    appendToLogs("Disconnected from the server...");
    socket.send("disconnect_request");
    return false;
  });
};