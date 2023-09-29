// setting up imports for the xbee serial connection
const SerialPort = require('serialport').SerialPort;
const XbeeAPI = require('xbee-api');
const C = XbeeAPI.constants;

class Xbee {
    xbeeAPI;
    serialport;

    configConnection(serialPath) {
        // this creates a new xbeeAPI object
        this.xbeeAPI = new XbeeAPI.XBeeAPI(
            {
                api_mode: 1,
            },
        );

        // sets up the USB serial port and baud rate
        this.serialport = new SerialPort(
            {
                path: serialPath,
                baudRate: 9600,
            });

        // creates the pipes between serial port and the xbeeAPI
        this.serialport.pipe(this.xbeeAPI.parser);
        this.xbeeAPI.builder.pipe(this.serialport);

        // supposed to receive data, but i don't think it works
        this.xbeeAPI.parser.on('data', function(frame) {
            console.log('>>', frame);
        });

        // open the serial port
        this.serialport.on('open', function() { });
    }

    sendMessage(msg) {
        const FrameOBJ = { // the frame_obj is the data to be sent
            type: C.FRAME_TYPE.AT_COMMAND,
            command: msg,
            commandParameter: [],
        };
        console.log(FrameOBJ);
        this.xbeeAPI.builder.write(FrameOBJ);
    }
}

module.exports = Xbee;
