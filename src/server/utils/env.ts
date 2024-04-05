import { config } from "dotenv";

config();

export const IS_PRODUCTION = process.env.NODE_ENV !== "production";
export const IS_DEVELOPMENT = !IS_PRODUCTION;
