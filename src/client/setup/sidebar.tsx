import { Button, NonIdealState, Spinner } from "@blueprintjs/core";
import { Dispatch, useState } from "react";
import { MessageHandler } from "../../common/message/message";
import { JoinQueue, UpdateQueue } from "../../common/message/game-message";
import { get, useEffectQuery, useSocket } from "../api";

function getMessageHandler(setQueue: Dispatch<string[]>): MessageHandler {
    return (message) => {
        if (message instanceof UpdateQueue) {
            console.log(message.queue);
            setQueue(message.queue.slice());
        }
    };
}

/**
 * Creates a sidebar to hold the queue elements
 * @returns sidebar container
 */
export function Sidebar(): JSX.Element {
    const [queue, setQueue] = useState<string[]>([]);
    const [name, setName] = useState<string>(
        "player " + Math.floor(Math.random() * 2000),
    );

    const sendMessage = useSocket(getMessageHandler(setQueue));

    const { isPending, data, isError } = useEffectQuery(
        "get-queue",
        async () => {
            return get("/get-queue").then((newQueue) => {
                setQueue(newQueue);
                return newQueue;
            });
        },
        true,
    );
    //ts wanted me to do something with my data
    data;
    if (isPending) {
        return (
            <NonIdealState
                icon={<Spinner intent="primary" />}
                title="Loading..."
            />
        );
    }
    if (isError) {
        console.log(isError);
    }

    return (
        <div className="sidebar">
            <h3 style={{ paddingTop: "20px", textAlign: "center" }}>
                Player Queue
            </h3>
            <ul style={{ listStyle: "decimal" }}>
                {queue.map(function (data) {
                    return <li key={data}>{data}</li>;
                })}
            </ul>
            <label
                style={{
                    position: "absolute",
                    bottom: "40px",
                    margin: "5px",
                }}
            >
                Name:
                <input
                    style={{ width: "90%" }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>
            <Button
                minimal
                type="submit"
                style={{ position: "absolute", bottom: "10px" }}
                onClick={async () => {
                    sendMessage(new JoinQueue(name));
                }}
            >
                Join queue
            </Button>
        </div>
    );
}
