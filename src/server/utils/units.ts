/**
 * The value of a degree in radians.
 * Usage:
 * 90 * DEGREE - Converts 90 degrees to radians (= 1.57)
 * 1.57 / DEGREE - Converts radians to degrees (= 90)
 */
export const DEGREE = Math.PI / 180;

/**
 * The value of a radian in radians.
 */
export const RADIAN = 1;

export const FULL_ROTATION = 360 * DEGREE;

export function clampHeading(heading: number) {
    // First mod knocks range to (-360, 360)
    // Then add 360 -> range is (0, 720)
    // Final mod results in [0, 360)
    return ((heading % FULL_ROTATION) + FULL_ROTATION) % FULL_ROTATION;
}
