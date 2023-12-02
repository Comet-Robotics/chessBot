import { Button, HTMLSelect } from "@blueprintjs/core";
import { Chess } from "chess.js";
import { useRef, useState } from "react";
import useWebSocket from "react-use-websocket";

export function Debug(): JSX.Element {
    const [bots, setBots] = useState<string[]>([])
    const selectRef = useRef<HTMLSelectElement>(null)
    const { sendMessage } = useWebSocket("ws://localhost:3000/ws", {
        onOpen: () => {
            console.log("Connection established");
            getIds()
        },
        onMessage: (event) => {
            const { data } = event

            const parsed = JSON.parse(data)
            console.log({ parsed })

            switch (parsed.type) {
                case "id_list":
                    const { ids } = parsed
                    setBots(ids)
                    break
                default:
                    console.log("unknown type:", parsed.type)
            }

        }
    });

    const getIds = () => {
        sendMessage(JSON.stringify({ type: 'get_ids' }))
    }

    const stop = (id: string) => {
        sendMessage(JSON.stringify({ type: "_stop", id }))
    }

    const driveTank = (id: string, left: number, right: number) => {
        sendMessage(JSON.stringify({ type: '_drive_tank', id, left, right }))
    }

    return (
        <div>
            <h1>This is a React page template</h1>
            <HTMLSelect ref={selectRef} onClick={getIds} >
                {bots.map((b) => <option key={b} value={b}>{b}</option>)}
            </HTMLSelect>

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

