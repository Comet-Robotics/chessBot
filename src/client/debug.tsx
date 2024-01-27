import { Dialog, DialogBody } from "@blueprintjs/core";
import { useNavigate } from "react-router-dom";

/**
 * A debug menu which can be used to manually control individual robots.
 */
export function Debug() {
    const navigate = useNavigate();
    return <Dialog
        isOpen
        canOutsideClickClose={false}
        onClose={() => navigate("..")}
        title="Debug"
    >
        <DialogBody>
        </DialogBody>
    </Dialog>;
}