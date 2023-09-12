# Welcome to chessBots!

## Project Setup
In order to work with the project, you must build the client when making changes, and launch the server in order to serve the client and server logic.
Follow the below steps.

### building the client
- in order to test production setup, you must build the client
- open the "chess-bot-client" folder in terminal
- run "npm install" to install node packages.
- run "npm run build" to build
- a static version of the client is now ready!

### webServer
- open the webServer folder in terminal
- run "npm install" to install node packages.
- run "npm start"
- webServer is now running. To make changes, close the server with ctrl+C
- Access the client via localhost:3000
- run "node server.js" to start it up again

## Working with server.js
- There are some stipulations when using server.js on your specific machine

### Configuring the serial port
- The serialPort for the xbee must be configured using the name of the port on your machine
- To do this on Windows, use `mode` in the terminal. This will list the serial connections on your computer. Note the name.
- In server.js, update the serialPort string name to your computers name:
`
//sets up the USB serial port and baud rate
var serialport = new SerialPort(
{
  path:"/dev/tty.usbserial-D30DNNZ0",
  baudRate:9600,
});
`
