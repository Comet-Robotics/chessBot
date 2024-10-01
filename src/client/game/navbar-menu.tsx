import {
    Button,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";
import { useNavigate } from "react-router-dom";
import { GameHoldMessage, GameInterruptedMessage } from "../../common/message/game-message";
import { GameHoldReason, GameInterruptedReason } from "../../common/game-end-reasons";
import { SendMessage } from "../../common/message/message";
import { Side } from "../../common/game-types";

interface NavbarMenuProps {
    sendMessage: SendMessage,
    side: Side
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
                                props.side === Side.WHITE ? GameInterruptedReason.WHITE_RESIGNED : GameInterruptedReason.BLACK_RESIGNED, // TODO change to either WHITE_RESIGNED or BLACK_RESIGNED
                            ),
                        );
                    }}
                />
                <Button
                    icon="pause"
                    minimal
                    text="Draw"
                    intent="danger"
                    onClick={async () => {
                        props.sendMessage(
                            new GameHoldMessage(
                                GameHoldReason.DRAW_CONFIRMATION, // TODO change to either WHITE_RESIGNED or BLACK_RESIGNED
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
