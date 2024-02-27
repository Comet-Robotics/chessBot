import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";

const renderRobotIds: ItemRenderer<string> = (
    robotId,
    { modifiers, handleFocus, handleClick },
) => {
    return (
        <MenuItem
            key={robotId}
            active={modifiers.active}
            roleStructure="listoption"
            text={"Robot " + robotId}
            onFocus={handleFocus}
            onClick={handleClick}
        />
    );
};

interface SelectRobotProps {
    robotIds: string[];
    selectedRobotId: string | undefined;
    onRobotIdSelected: (robotId: string) => void;
}

/**
 * Creates a selector for a robot.
 */
export function SelectRobot(props: SelectRobotProps) {
    const hasSelection = props.selectedRobotId !== undefined;

    return (
        <Select<string>
            items={props.robotIds}
            itemRenderer={renderRobotIds}
            onItemSelect={props.onRobotIdSelected}
            filterable={false}
            popoverProps={{ minimal: true }}
        >
            <Button
                text={
                    hasSelection ?
                        "Robot " + props.selectedRobotId
                    :   "Select a robot..."
                }
                rightIcon="double-caret-vertical"
            />
        </Select>
    );
}
