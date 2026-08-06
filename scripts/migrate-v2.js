import { openDb } from '../lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const db = await openDb();
  console.log('Iniciando migração V2 do banco de dados...');

  // Criar tabelas se não existirem
  await db.exec(`
    CREATE TABLE IF NOT EXISTS professional_services (
      professional_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      PRIMARY KEY (professional_id, service_id),
      FOREIGN KEY (professional_id) REFERENCES professionals (id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS professional_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      professional_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1,
      start_time TEXT DEFAULT '09:00',
      end_time TEXT DEFAULT '19:00',
      has_break INTEGER DEFAULT 0,
      break_start TEXT DEFAULT '12:00',
      break_end TEXT DEFAULT '13:00',
      FOREIGN KEY (professional_id) REFERENCES professionals (id) ON DELETE CASCADE,
      UNIQUE(professional_id, day_of_week)
    );
  `);

  // Adicionar colunas na tabela professionals caso não existam
  const columnsToAdd = [
    { name: 'commission_rate', type: 'REAL DEFAULT 50' },
    { name: 'bio', type: 'TEXT' },
    { name: 'specialties', type: 'TEXT' },
    { name: 'photo_url', type: 'TEXT' },
    { name: 'instagram_url', type: 'TEXT' }
  ];

  for (const col of columnsToAdd) {
    try {
      await db.exec(`ALTER TABLE professionals ADD COLUMN ${col.name} ${col.type};`);
      console.log(`Coluna ${col.name} adicionada com sucesso na tabela professionals.`);
    } catch (err) {
      // Coluna já pode existir
    }
  }

  console.log('Migração V2 concluída com sucesso!');
}

migrate().catch(err => {
  console.error('Erro na migração V2:', err);
});
