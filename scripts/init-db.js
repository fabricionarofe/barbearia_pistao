import { openDb } from '../lib/db.js';

async function setup() {
  const db = await openDb();

  // Tabela de Serviços
  await db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_minutes INTEGER NOT NULL,
      is_active INTEGER DEFAULT 1
    );
  `);

  // Tabela de Profissionais
  await db.exec(`
    CREATE TABLE IF NOT EXISTS professionals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      commission_rate REAL DEFAULT 50,
      bio TEXT,
      specialties TEXT,
      photo_url TEXT,
      instagram_url TEXT,
      is_active INTEGER DEFAULT 1
    );
  `);

  // Tabela de Vínculo Profissional x Serviço
  await db.exec(`
    CREATE TABLE IF NOT EXISTS professional_services (
      professional_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      PRIMARY KEY (professional_id, service_id),
      FOREIGN KEY (professional_id) REFERENCES professionals (id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
    );
  `);

  // Tabela de Expediente Individual do Profissional
  await db.exec(`
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

  // Tabela de Clientes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Tabela de Agendamentos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      professional_id INTEGER,
      service_id INTEGER,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (id),
      FOREIGN KEY (professional_id) REFERENCES professionals (id),
      FOREIGN KEY (service_id) REFERENCES services (id)
    );
  `);

  // Tabela de Configurações / Expediente
  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Inserir dados iniciais se estiver vazio (apenas para facilitar testes se a tabela settings estiver vazia)
  const settingsCount = await db.get('SELECT COUNT(*) as count FROM settings');
  if (settingsCount.count === 0) {
    await db.run(`INSERT INTO settings (key, value) VALUES ('work_hours', '{"start":"09:00","end":"19:00"}')`);
    await db.run(`INSERT INTO settings (key, value) VALUES ('work_days', '{"1":true,"2":true,"3":true,"4":true,"5":true,"6":true,"0":false}')`); // Seg a Sábado
    await db.run(`INSERT INTO settings (key, value) VALUES ('site_theme', '{"primary_color":"#EAB308","logo_url":"/img/logo.jpeg","banner_url":""}')`);
    await db.run(`INSERT INTO settings (key, value) VALUES ('social_links', '{"instagram":"","facebook":"","tiktok":"","youtube":"","website":"","twitter":""}')`);
  }

  console.log('Banco de dados inicializado com sucesso.');
}

setup().catch(err => {
  console.error('Erro ao inicializar BD:', err);
});

