import { Card, Button, H1, Tooltip } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../api";

type SimulatedRobot = { position: { x: number, y: number }, heading: number }

const size = 65
const cellCount = 12
export function Simulator() {
    // TODO: need to send robot positions in websocket for live refreshes
    const navigate = useNavigate();

    const [robotState, setRobotState] = useState<{[robotId: string]: SimulatedRobot}>({});

    useEffect(() => {
        const fetchRobotState = async () => {
            const { robotState } = await get("/get-simulator-robot-state");
            setRobotState(robotState);
        }
        fetchRobotState();
    }, []);

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
        </Card>
    )
}

function Robot(props: { pos: SimulatedRobot, robotId: string }) {
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