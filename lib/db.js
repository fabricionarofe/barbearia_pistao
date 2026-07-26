import { createClient } from '@libsql/client';

let client = null;

export async function openDb() {
  if (!client) {
    // Para ambiente local, usa as variáveis do .env
    // Na Vercel, usará as Environment Variables configuradas lá
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  // Retorna um objeto que simula a API da biblioteca 'sqlite' original
  return {
    all: async (sql, params = []) => {
      const result = await client.execute({ sql, args: params });
      return result.rows;
    },
    get: async (sql, params = []) => {
      const result = await client.execute({ sql, args: params });
      return result.rows[0];
    },
    run: async (sql, params = []) => {
      const result = await client.execute({ sql, args: params });
      return { 
        lastID: result.lastInsertRowid ? result.lastInsertRowid.toString() : null, 
        changes: result.rowsAffected 
      };
    },
    exec: async (sql) => {
      await client.executeMultiple(sql);
    }
  };
}
