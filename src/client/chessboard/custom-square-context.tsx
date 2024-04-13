import { createContext } from "react";
import { ChessEngine } from "../../common/chess-engine";

export const CustomSquareContext = createContext({
    legalSquares: [] as string[],
    chess: new ChessEngine(),
});
