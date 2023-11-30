import { Alignment, Button, Navbar } from "@blueprintjs/core";

interface NavbarMenuProps {
    onSettingsClick: () => void;
    onRestartClick: () => void;
};

export function NavbarMenu(props: NavbarMenuProps): JSX.Element {
    return (<Navbar>
        <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>ChessBot</Navbar.Heading>
            <Navbar.Divider />
            <Button icon="cog" minimal={true} text="Settings" onClick={props.onSettingsClick} />
            <Button icon="reset" minimal={true} text="Restart game" onClick={props.onRestartClick} />
        </Navbar.Group>
    </Navbar>);
}