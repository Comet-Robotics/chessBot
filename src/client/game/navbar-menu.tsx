import {
    Button,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";
import { useNavigate } from "react-router-dom";
import {
    GameHoldMessage,
    GameInterruptedMessage,
} from "../../common/message/game-message";
import {
    GameHoldReason,
    GameInterruptedReason,
} from "../../common/game-end-reasons";
import { SendMessage } from "../../common/message/message";
import { Side } from "../../common/game-types";
import { Dispatch } from "react";

interface NavbarMenuProps {
    sendMessage: SendMessage;
    side: Side;
    setRotation: Dispatch<React.SetStateAction<number>>; //set state type
}

export function NavbarMenu(props: NavbarMenuProps): JSX.Element {
    // Store react router state for game
    const navigate = useNavigate();

    /** create navbar rotate button */
    const rotateButton =
        props.side === Side.SPECTATOR ?
            <Button
                minimal
                text="Rotate"
                intent="primary"
                onClick={() => {
                    props.setRotation((oldRotation) => {
                        return oldRotation + 90;
                    });
                }}
            />
        :   "";

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
                                props.side === Side.WHITE ?
                                    GameInterruptedReason.WHITE_RESIGNED
                                :   GameInterruptedReason.BLACK_RESIGNED,
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
                                GameHoldReason.DRAW_CONFIRMATION,
                            ),
                        );
                    }}
                />
            </NavbarGroup>
            <NavbarGroup align="right">
                {rotateButton}
                <h3>{props.side}</h3>
                <Button icon="cog" minimal onClick={() => navigate("/debug")} />
            </NavbarGroup>
        </Navbar>
    );
}
