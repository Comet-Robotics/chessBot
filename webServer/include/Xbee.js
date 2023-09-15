//setting up imports for the xbee serial connection
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var C = xbee_api.constants;

class Xbee
{
    xbeeAPI;
    serialport;

    configConnection(serialPath)
    {
        //this creates a new xbeeAPI object
        this.xbeeAPI = new xbee_api.XBeeAPI(
            {
                api_mode: 1
            }
        );

        //sets up the USB serial port and baud rate
        this.serialport = new SerialPort(
            {
                path: serialPath,
                baudRate: 9600,
            });

        //creates the pipes between serial port and the xbeeAPI
        this.serialport.pipe(xbeeAPI.parser);
        this.xbeeAPI.builder.pipe(serialport);

        //supposed to receive data, but i don't think it works 
        this.xbeeAPI.parser.on("data", function (frame) {
            console.log(">>", frame);
        });

        //open the serial port
        this.serialport.on("open", function () { });
    }

    sendMessage(msg)
    {
        var frame_obj = { //the frame_obj is the data to be sent
            type: C.FRAME_TYPE.AT_COMMAND,
            command: msg,
            commandParameter: [],
        };
        this.xbeeAPI.builder.write(frame_obj);
    }


}

module.exports = Xbee;