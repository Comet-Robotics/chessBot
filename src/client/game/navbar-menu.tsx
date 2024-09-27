import {
    Button,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";
import { useNavigate } from "react-router-dom";
import { GameInterruptedMessage } from "../../common/message/game-message";
import { GameInterruptedReason } from "../../common/game-end-reasons";
import { SendMessage } from "../../common/message/message";

interface NavbarMenuProps {
    sendMessage: SendMessage;
}

/**
 * Creates a navbar with a title and the abort, resign, and debug buttons
 * 
 * @param props - message handler for abort/resign
 * @returns 
 */
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
                            new GameInterruptedMessage(
                                GameInterruptedReason.ABORTED,
                            ),
                        );
                    }}
                />
                <Button
                    icon="flag"
                    minimal
                    text="Resign"
                    intent="danger"
                    onClick={async () => {
                        props.sendMessage(
                            new GameInterruptedMessage(
                                GameInterruptedReason.ABORTED, // TODO change to either WHITE_RESIGNED or BLACK_RESIGNED
                            ),
                        );
                    }}
                />
            </NavbarGroup>
            <NavbarGroup align="right">
                <Button icon="cog" minimal onClick={() => navigate("/debug")} />
            </NavbarGroup>
        </Navbar>
    );
}
