import { Slider } from "@blueprintjs/core";

interface DriveSliderProps {
    power: number;
    onChange: (value: number) => void;
}

/**
 * creates a slider to show power values in debug driving
 * @param props - the value of the slider
 * @returns
 */
export function DriveSlider(props: DriveSliderProps) {
    return (
        <Slider
            disabled
            min={-1}
            max={1}
            stepSize={0.01}
            value={props.power}
            initialValue={0}
            onChange={props.onChange}
            vertical
            showTrackFill={props.power !== 0}
        />
    );
}
