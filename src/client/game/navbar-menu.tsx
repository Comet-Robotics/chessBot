import {
    Button,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";
import { useNavigate, useNavigation } from "react-router-dom";
import { SendMessage } from "react-use-websocket";
import { StopGameMessage } from "../../common/message/game-message";
import { StopGameReason } from "../../common/game-end";

interface NavbarMenuProps {
    sendMessage: SendMessage;
}

export function NavbarMenu(props: NavbarMenuProps): JSX.Element {
    // Store react router state for game
    const navigate = useNavigate();
    return (
        <Navbar>
            <NavbarGroup>
                <NavbarHeading>ChessBot</NavbarHeading>
                <NavbarDivider />
                <Button
                    icon="warning-sign"
                    minimal
                    text="Abort Game"
                    intent="warning"
                    onClick={async () => {
                        props.sendMessage(
                            new StopGameMessage(
                                StopGameReason.ABORTED,
                            ).toJson(),
                        );
                    }}
                />
            </NavbarGroup>
            <NavbarGroup align="right">
                <Button icon="cog" minimal onClick={() => navigate("debug")} />
            </NavbarGroup>
        </Navbar>
    );
}
