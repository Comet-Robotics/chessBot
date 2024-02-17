import { useNavigate } from "react-router-dom";
import { post } from "../api";

export function SetupHumanGame() {
    const navigate = useNavigate();
    post("/human").then((data) => {
        console.log(data.playerType);
        if (data.playerType == 0) {
            navigate("/setup-host-game");
        } else if (data.playerType == 1) {
            navigate("/setup-client-game");
        } else {
            // spectator should have no controls
            navigate("/setup");
        }
    });
    return null;
}
