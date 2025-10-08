import postgres from "postgres";
import type { H3Event } from "h3";

let prodClient: ReturnType<typeof postgres> | null = null;
let devClient: ReturnType<typeof postgres> | null = null;

export const useDatabase = (event?: H3Event, mode: "prod" | "dev" = "prod") => {
  const runtimeConfig = useRuntimeConfig(event);

  const postgresOpt = {
    ssl: "prefer" as const,
    max: 1,             // 1 connections
    idle_timeout: 10,   // 10 seconds
    max_lifetime: 1200, // 20 minutes
  };

  if (mode === "dev") {
    if (!devClient) {
      devClient = postgres(runtimeConfig.databaseDevUrl, postgresOpt);
    }
    return devClient;
  }

  if (!prodClient) {
    prodClient = postgres(runtimeConfig.databaseUrl, postgresOpt);
  }
  return prodClient;
};
