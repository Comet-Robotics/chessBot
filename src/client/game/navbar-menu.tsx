import {
    Button,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";
import { useNavigate } from "react-router-dom";

interface NavbarMenuProps {}

export function NavbarMenu(props: NavbarMenuProps): JSX.Element {
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
                    text="Restart game"
                    onClick={() => {}}
                />
            </NavbarGroup>
        </Navbar>
    );
}
