import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { createClient } from '@libsql/client';
import path from 'path';

async function migrate() {
  console.log('Iniciando migração do SQLite local para o Turso...');

  // 1. Conectar ao SQLite local
  const localDb = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });

  // 2. Conectar ao Turso
  const tursoClient = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const tables = ['settings', 'services', 'professionals', 'clients', 'appointments'];

  for (const table of tables) {
    console.log(`Migrando tabela: ${table}`);
    
    // Ler do local
    const rows = await localDb.all(`SELECT * FROM ${table}`);
    if (rows.length === 0) {
      console.log(`  Sem dados para migrar em ${table}`);
      continue;
    }

    // Inserir no Turso
    const columns = Object.keys(rows[0]);
    
    for (const row of rows) {
      const placeholders = columns.map(() => '?').join(', ');
      const values = columns.map(col => row[col]);
      
      try {
        await tursoClient.execute({
          sql: `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
          args: values
        });
      } catch (err) {
        console.error(`  Erro ao inserir na tabela ${table}:`, err.message);
      }
    }
    console.log(`  Migrados ${rows.length} registros para ${table}`);
  }

  console.log('Migração concluída com sucesso!');
}

migrate().catch(console.error);
