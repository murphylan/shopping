import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });

/** 关闭连接池（供 CLI 脚本如 db:seed 退出进程前调用，否则会挂起） */
export async function closeDb() {
  await client.end({ timeout: 5 });
}
