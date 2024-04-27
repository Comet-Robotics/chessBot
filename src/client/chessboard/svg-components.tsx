interface PieceSquareProps {
    width: string | number;
    height: string | number;
}

/**
 * SVG of the highlight used to show a legal capture
 */
export function OutsideCorners(props: PieceSquareProps) {
    return (
        <div
            style={{
                ...props,
                position: "absolute",
            }}
        >
            <svg
                viewBox={"0 0 298 298"}
                height={"100%"}
                width={"100%"}
                style={{
                    position: "relative",
                }}
                display="block"
            >
                <path
                    d="M84.52,0H0v84.52C16.49,46.8,46.8,16.49,84.52,0Z"
                    fill="green"
                />
                <path
                    d="M300,84.52V0h-84.52c37.73,16.49,68.03,46.8,84.52,84.52Z"
                    fill="green"
                />
                <path
                    d="M0,215.48v84.52h84.52C46.8,283.51,16.49,253.2,0,215.48Z"
                    fill="green"
                />
                <path
                    d="M215.48,300h84.52v-84.52c-16.49,37.73-46.8,68.03-84.52,84.52Z"
                    fill="green"
                />
            </svg>
        </div>
    );
}

/**
 * SVG of the circle used to show legal moves
 * */
export function CenterDot() {
    return (
        <svg display="block">
            <circle cx="50%" cy="50%" r="15%" fill="green" />
        </svg>
    );
}
