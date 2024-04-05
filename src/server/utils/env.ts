import { config } from "dotenv";

config();

export const isProduction = process.env.NODE_ENV !== "production";
export const isDevelopment = !isProduction;
