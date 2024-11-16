import { Button, NonIdealState, Spinner } from "@blueprintjs/core";
import { Dispatch, useState } from "react";
import { MessageHandler } from "../../common/message/message";
import { JoinQueue, UpdateQueue } from "../../common/message/game-message";
import { get, useEffectQuery, useSocket } from "../api";

function getMessageHandler(setQueue: Dispatch<string[]>): MessageHandler {
    return (message) => {
        console.log("cool message box");
        if (message instanceof UpdateQueue) {
            console.log(message.queue);
            setQueue(message.queue);
        }
    };
}

export function Sidebar(): JSX.Element {
    const [queue, setQueue] = useState<string[]>([]);

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
    data;
    if (isPending) {
        return (
            <NonIdealState
                icon={<Spinner intent="primary" />}
                title="Loading..."
            />
        );
    } 
    if(isError){
        console.log(isError);
    }

    return (
        <div className="sidebar">
            <h3 style={{ textAlign: "center" }}>Player Queue</h3>
            <ul style={{ listStyle: "decimal" }}>
                {queue.map(function (data) {
                    return <li key={data}>{data}</li>;
                })}
            </ul>
            <Button
                minimal
                style={{ position: "absolute", bottom: "10px" }}
                onClick={async () => {
                    sendMessage(new JoinQueue("yay" + Math.random() * 100));
                }}
            >
                Join queue
            </Button>
        </div>
    );
}
