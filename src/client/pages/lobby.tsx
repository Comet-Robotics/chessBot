import useWebSocket from "react-use-websocket";

function checkConnections() {
    return (msg: MessageEvent<any>) => {
        const message = JSON.parse(msg.data.toString());
        console.log(message);
    };
}

export function Lobby(): JSX.Element {
    const { sendMessage } = useWebSocket("ws://localhost:3000/ws", {
        onOpen: () => {
            console.log("Connection established");
        },
        onMessage: checkConnections(),
    });

    return (
        <>
            <div id="body-container">
                <h1>
                    test
                </h1>
            </div>
        </>
    );
}