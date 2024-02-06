import {
    Button,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";

interface NavbarMenuProps {}

export function NavbarMenu(props: NavbarMenuProps): JSX.Element {
    return (
        <Navbar>
            <NavbarGroup>
                <NavbarHeading>ChessBot</NavbarHeading>
                <NavbarDivider />
                <Button icon="cog" minimal text="Settings" />
                <Button icon="reset" minimal text="Restart game" />
            </NavbarGroup>
        </Navbar>
    );
}
