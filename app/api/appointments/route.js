import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const db = await openDb();
    
    let appointments;
    if (date) {
      appointments = await db.all(`
        SELECT a.*, c.name as client_name, c.phone as client_phone, s.name as service_name, p.name as professional_name
        FROM appointments a
        JOIN clients c ON a.client_id = c.id
        JOIN services s ON a.service_id = s.id
        JOIN professionals p ON a.professional_id = p.id
        WHERE a.appointment_date = ?
        ORDER BY a.appointment_time ASC
      `, [date]);
    } else {
      appointments = await db.all(`
        SELECT a.*, c.name as client_name, c.phone as client_phone, s.name as service_name, p.name as professional_name
        FROM appointments a
        JOIN clients c ON a.client_id = c.id
        JOIN services s ON a.service_id = s.id
        JOIN professionals p ON a.professional_id = p.id
        ORDER BY a.appointment_date DESC, a.appointment_time ASC
      `);
    }
    
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientName, clientPhone, clientEmail, professionalId, serviceId, date, time } = body;
    
    const db = await openDb();
    
    // 1. Tentar encontrar cliente ou criar um novo
    let clientId;
    const existingClient = await db.get('SELECT id FROM clients WHERE phone = ?', [clientPhone]);
    
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const clientResult = await db.run(
        'INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)',
        [clientName, clientPhone, clientEmail || null]
      );
      clientId = clientResult.lastID;
    }
    
    // 2. Verificar se o horário já está ocupado
    const existingAppointment = await db.get(
      "SELECT id FROM appointments WHERE professional_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'",
      [professionalId, date, time]
    );
    
    if (existingAppointment) {
      return NextResponse.json({ error: 'Horário já está reservado' }, { status: 400 });
    }
    
    // 3. Criar o agendamento
    const appointmentResult = await db.run(
      'INSERT INTO appointments (client_id, professional_id, service_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?)',
      [clientId, professionalId, serviceId, date, time, 'pending']
    );
    
    return NextResponse.json({ success: true, appointmentId: appointmentResult.lastID, isExistingClient: !!existingClient });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Erro ao criar agendamento', stack: error.stack }, { status: 500 });
  }
}
