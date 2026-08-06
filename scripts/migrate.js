import { openDb } from '../lib/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function migrate() {
  const db = await openDb();

  console.log('Iniciando migração do banco de dados...');

  // Criar novas tabelas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS professional_services (
      professional_id INTEGER,
      service_id INTEGER,
      PRIMARY KEY (professional_id, service_id),
      FOREIGN KEY (professional_id) REFERENCES professionals (id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
    );
  `);
  console.log('Tabela professional_services verificada/criada.');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS professional_schedules (
      professional_id INTEGER,
      day_of_week INTEGER,
      start_time TEXT,
      end_time TEXT,
      break_start TEXT,
      break_end TEXT,
      is_working INTEGER DEFAULT 1,
      PRIMARY KEY (professional_id, day_of_week),
      FOREIGN KEY (professional_id) REFERENCES professionals (id) ON DELETE CASCADE
    );
  `);
  console.log('Tabela professional_schedules verificada/criada.');

  // Adicionar colunas em professionals (ignora se já existir)
  const columnsToAdd = [
    "ALTER TABLE professionals ADD COLUMN email TEXT;",
    "ALTER TABLE professionals ADD COLUMN commission_rate REAL DEFAULT 50.0;",
    "ALTER TABLE professionals ADD COLUMN bio TEXT;",
    "ALTER TABLE professionals ADD COLUMN specialties TEXT;",
    "ALTER TABLE professionals ADD COLUMN photo_url TEXT;"
  ];

  for (const query of columnsToAdd) {
    try {
      await db.exec(query);
      console.log(`Sucesso: ${query}`);
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log(`Coluna já existe: ${query}`);
      } else {
        console.error(`Erro ao rodar: ${query}`, e.message);
      }
    }
  }

  console.log('Migração concluída com sucesso!');
}

migrate().catch(err => {
  console.error('Erro crítico na migração:', err);
});
