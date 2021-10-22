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
  var img_socket = new WebSocket(
    "ws://" + window.location.host + "/ws_camera_feed"
  );

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
    sendRequest("camera", c, $("#camera_mode_data").val());
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
}