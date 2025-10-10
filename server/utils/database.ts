import postgres from "postgres";
import type { H3Event } from "h3";
import { getRequestIP } from "h3";

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

export type AuditLogData = {
  actor?: string | number;
  action: string;
  target: string | number;
  status: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export const insertAuditLog = async (data: AuditLogData, event?: H3Event) => {
  const sql = useDatabase(event);

  const ipAddress = event ? getRequestIP(event) : null;

  try {
    await sql`
      INSERT INTO internal_admin.audit_logs (
        actor,
        action,
        target,
        status,
        description,
        metadata,
        ip_address
      ) VALUES (
        ${data.actor ?? null},
        ${data.action},
        ${data.target},
        ${data.status},
        ${data.description ?? null},
        ${data.metadata ? JSON.stringify(data.metadata) : null},
        ${ipAddress ?? null}
      )
    `;
  } catch (error) {
    console.error("Error inserting audit log: ", error);
  }
}