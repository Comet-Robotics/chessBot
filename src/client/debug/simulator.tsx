import { Card, Button, H1, Tooltip, H2 } from "@blueprintjs/core";
import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, useSocket } from "../api";
import { SimulatedRobotLocation, SimulatorUpdateMessage, StackFrame } from "../../common/message/simulator-message";



const size = 65
const cellCount = 12
export function Simulator() {
    const navigate = useNavigate();

    type RobotState = { [robotId: string]: SimulatedRobotLocation };

    type Action =
        | { type: "SET_ALL_ROBOTS"; payload: RobotState }
        | { type: "UPDATE_ROBOT"; payload: { robotId: string; state: SimulatedRobotLocation } };

    const robotStateReducer = (state: RobotState, action: Action): RobotState => {
        switch (action.type) {
            case "SET_ALL_ROBOTS":
                return action.payload;
            case "UPDATE_ROBOT":
                return {
                    ...state,
                    [action.payload.robotId]: action.payload.state,
                };
            default:
                return state;
        }
    };

    const [robotState, dispatch] = useReducer(robotStateReducer, {});
    const [messageLog, setMessageLog] = useState<{message: SimulatorUpdateMessage, ts: Date}[]>([]);

    useSocket(
        (message) => {
            if (message instanceof SimulatorUpdateMessage) {
                dispatch({ type: "UPDATE_ROBOT", payload: { robotId: message.robotId, state: message.location } });
                setMessageLog((log) => [...log, {message, ts: new Date()}]);
            }
        }
    );

    const fetchRobotState = async () => {
        const { robotState, messages } = await get("/get-simulator-robot-state");
        dispatch({ type: "SET_ALL_ROBOTS", payload: robotState });
        setMessageLog(messages);
    }

    useEffect(() => {
        fetchRobotState();
    }, []);

    const openInEditor = async (frame: StackFrame) => {
        if (!frame) {
            console.warn("No stack frame provided for opening in editor");
            return
        }
        await fetch(`/__open-in-editor?file=${frame.fileName}&line=${frame.lineNumber}&column=${frame.columnNumber}`);
    }

    return (
        <Card>
            <Button
                minimal
                style={{ float: "right" }}
                icon="home"
                onClick={() => navigate("/home")}
            />
            <Button
                minimal
                style={{ float: "right" }}
                icon="cog"
                onClick={() => navigate("/debug")}
            />
            <H1>Robot Simulator</H1>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cellCount}, ${size}px)`, gridTemplateRows: `repeat(${cellCount}, ${size}px)`, position: "relative" }}>
                {new Array(cellCount * cellCount).fill(undefined).map((_, i) => {
                    const row = Math.floor(i / cellCount);
                    const col = i % cellCount;
                    const isCenterCell = row >= 2 && row < 10 && col >= 2 && col < 10;
                    return (
                        <div key={i} style={{ border: "1px solid black", backgroundColor: !isCenterCell ? "lightgray" : "transparent" }}/>
                    )
                })}
                {Object.entries(robotState).map(([robotId, pos]) => {
                    return <Robot pos={pos} robotId={robotId} key={robotId} />
                })}
            </div>
            <div>
                <H2>Message Log</H2>
                {messageLog.map(({message, ts}, i) => {
                    return <div key={i}>
                        <div>{ts.toLocaleString()}</div>
                        <div>{message.robotId}: {JSON.stringify(message.location)}</div>
                        <div>{message.packet.type}</div>
                        {/* TODO: add stack trace */}
                    </div>
                })}
                
            </div>
        </Card>
    )
}

function Robot(props: { pos: SimulatedRobotLocation, robotId: string }) {
    return (
        <div style={{position: "absolute", left: `${(props.pos.position.x * size)}px`, bottom: `${props.pos.position.y * size}px`,}}>
            <Tooltip content={`${props.robotId}: ${JSON.stringify(props.pos)}`}>
                <div style={{ transform: `rotate(${props.pos.heading}rad)`, backgroundColor: "white", borderRadius: "50%", border: "4px solid black", display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: size, height: size, padding: '2px', boxShadow: "0 0 10px black" }}>
                    <div style={{ width: size/4, height: size/4, backgroundColor: "black", borderRadius: "50%" }} />
                </div>
            </Tooltip>
        </div>
    );
}