import {
    Button,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";
import { useNavigate } from "react-router-dom";
import { post } from "../api";

export function NavbarMenu(): JSX.Element {
    const navigate = useNavigate();
    return (
        <Navbar>
            <NavbarGroup>
                <NavbarHeading>ChessBot</NavbarHeading>
                <NavbarDivider />
                <Button
                    icon="cog"
                    minimal
                    text="Settings"
                    onClick={() => navigate("debug")}
                />
                <Button
                    icon="reset"
                    minimal
                    text="Abort game"
                    onClick={async () => {
                        await post("/abort-game");
                        navigate("/setup");
                    }}
                />
            </NavbarGroup>
        </Navbar>
    );
}
