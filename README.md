# Web Player Remote Control Server

The Web Player Remote Control Server (WPRC Server) is the offical WebSocket server for the [Web Player Remote Control](https://github.com/shft5410/web_player_remote_control) browser extension.
It is a simple HTTP to WebSocket relay server that allows you to send commands via HTTP POST requests, which are then broadcasted to the connected WebSocket clients, i.e., the Web Player Remote Control browser extension.

## Installation & Setup

1. **Install** [Node.js](https://nodejs.org/) on your machine if you haven't already.

2. **Download** the `web_player_remote_control_server-x.x.x.zip` folder from the [latest GitHub release](https://github.com/shft5410/web_player_remote_control_server/releases/latest) and **extract** it to a directory of your choice.

3. **Open** a terminal in the directory where you extracted the server files and **run** `npm install` to install the required dependencies.

4. **Start** the server by running `node index.js`.
   By default, the server will listen on port `9772`.
   Please refer to the [Configuration](#configuration) section for details on how to change the port or other settings.

5. **Ensure** the server started without errors and is running properly. You can check the server logs for any issues.

## WebSocket Endpoint

The server provides a WebSocket endpoint for the browser extension to connect to.
All commands sent to the [HTTP endpoint](#http-endpoint) will be broadcasted to the connected WebSocket clients on this endpoint.

```
ws://<host>:<port>
```

## HTTP Endpoint

The server provides an HTTP endpoint for sending commands to the browser extension.
All commands sent to this endpoint will be broadcasted to the connected WebSocket clients on [WebSocket endpoint](#websocket-endpoint).

The endpoint accepts `POST` requests with various content types, however, it is recommended to use `application/json` for sending commands in the JSON format.

```
http://<host>:<port>/command
```

A sample request to the HTTP endpoint looks like this:

```http
POST http://localhost:9772/command
Content-Type: application/json

{
   "type": "set-volume",
   "payload": 0.8
}
```

## Configuration

The server can be configured on startup using command line arguments.
The following options are available:

| Option   | Default     | Description                                                                                    |
| -------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `--port` | `9772`      | The port on which the server will listen for incoming WebSocket connections and HTTP requests. |
| `--host` | `localhost` | The host address on which the server will listen.                                              |
| `--log`  | `info`      | The log level for the server. Available levels are `debug`, `info`, `error`, and `silent`.     |
