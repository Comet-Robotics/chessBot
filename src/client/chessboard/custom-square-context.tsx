import { createContext } from "react";
import { ChessEngine } from "../../common/chess-engine";

/**
 * A context used to pass arguments to custom square renderer.
 */
export const CustomSquareContext = createContext({
    // default values for type hinting
    legalSquares: [] as string[],
    chess: new ChessEngine(),
});
