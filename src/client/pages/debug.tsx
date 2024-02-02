import { Button, HTMLSelect } from "@blueprintjs/core";
import { useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { ManualMoveMessage, StopMessage } from "../../common/message";

export function Debug(): JSX.Element {
    const [robotIds, setRobotIds] = useState<string[]>([]);
    const selectRef = useRef<HTMLSelectElement>(null);
    const { sendMessage } = useWebSocket("ws://localhost:3000/ws");


    // const { sendMessage } = useWebSocket("ws://localhost:3000/ws", {
    //     onOpen: () => {
    //         console.log("Connection established");
    //         // getIds();
    //     },
    //     onMessage: (event) => {
    //         const { data } = event

    //         const parsed = JSON.parse(data)
    //         console.log({ parsed })

    //         switch (parsed.type) {
    //             // case "id_list":
    //             //     const { ids } = parsed
    //             //     setBots(ids)
    //             //     break
    //             default:
    //                 console.log("unknown type:", parsed.type)
    //         }

    //     }
    // });

    // const getIds = () => {
    //     sendMessage(JSON.stringify({ type: 'get_ids' }))
    // }

    const stop = (id: string) => {
        sendMessage(new StopMessage(id).toJson());
    }

    const driveTank = (id: string, leftPower: number, rightPower: number) => {
        sendMessage(new ManualMoveMessage(id, leftPower, rightPower).toJson());
    }

    return (
        <div>
            <h1>This is a React page template</h1>
            {/* <HTMLSelect ref={selectRef} onClick={} >
                {robotIds.map((b) => <option key={b} value={b}>{b}</option>)}
            </HTMLSelect> */}

            <Button onClick={() => {
                const lol = selectRef.current?.selectedOptions[0].value
                console.log({ lol })
                if (!lol) return
                driveTank(lol, 0, 0)
            }}>Stop</Button>
            <Button onClick={() => {
                const lol = selectRef.current?.selectedOptions[0].value
                console.log({ lol })
                if (!lol) return
                driveTank(lol, 1, 1)
            }}>Set to MAX</Button>
        </div>
    );
};

