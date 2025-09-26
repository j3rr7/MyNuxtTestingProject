import postgres from 'postgres'

declare module 'nitropack' {
  interface NitroApp {
    sql?: ReturnType<typeof postgres>
  }
}

export default defineNitroPlugin((nitroApp) => {
    const runtimeConfig = useRuntimeConfig()
    const sql = postgres(runtimeConfig.databaseUrl, { ssl: "prefer", max: 3 })
    nitroApp.sql = sql
    nitroApp.hooks.hook('close', async () => {
        await sql.end({ timeout: 1000 })
    })
})