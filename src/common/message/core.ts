import {
    Number as NumberType,
    Static,
    Runtype,
    Unknown,
    Record as RecordType,
    Optional,
} from "runtypes";
import { SQUARES } from "chess.js";
import { PieceType } from "../game-types";

// See https://github.com/runtypes/runtypes/issues/66#issuecomment-788129292
export function runtypeFromEnum<EnumType>(
    theEnum: Record<string, string | EnumType>,
): Runtype<EnumType> {
    let values = Object.values<unknown>(theEnum);
    const number_values = values.filter((v) => typeof v === "number");
    if (number_values.length > 0) {
        values = number_values;
    }
    const isEnumValue = (input: unknown): input is EnumType =>
        values.includes(input);
    const errorMessage = (input: unknown): string =>
        `Failed constraint check. Expected one of ${JSON.stringify(values)}, but received ${JSON.stringify(input)}`;
    return Unknown.withConstraint<EnumType>(
        (object: unknown) => isEnumValue(object) || errorMessage(object),
    );
}

export function runtypeFromArray<ArrayType>(
    theArray: ArrayType[],
): Runtype<ArrayType> {
    const isArrayValue = (input: unknown): input is ArrayType =>
        theArray.includes(input as ArrayType);
    const errorMessage = (input: unknown): string =>
        `Failed constraint check. Expected one of ${JSON.stringify(theArray)}, but received ${JSON.stringify(input)}`;
    return Unknown.withConstraint<ArrayType>(
        (object: unknown) => isArrayValue(object) || errorMessage(object),
    );
}

export const Float = NumberType.withConstraint((n) => Number.isFinite(n), {
    name: "float",
});
export const Int32 = Float.withConstraint((n) => Number.isSafeInteger(n), {
    name: "int32",
});
export const Uint32 = Int32.withConstraint((n) => n >= 0, { name: "uint32" });

export const VarId = Uint32;
export const MotorPower = Float.withConstraint((n) => -1 <= n && n <= 1, {
    name: "motor_power",
});
export const DrivePower = RecordType({
    left: MotorPower,
    right: MotorPower,
});
export type DrivePower = Static<typeof DrivePower>;

export const SquareType = runtypeFromArray(SQUARES);

export const Move = RecordType({
    from: SquareType,
    to: SquareType,
    promotion: Optional(runtypeFromEnum(PieceType)),
});
export type Move = Static<typeof Move>;
