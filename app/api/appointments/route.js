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
    const { clientName, clientPhone, clientEmail, professionalId, serviceId, serviceIds, date, time } = body;
    
    const servicesToBook = serviceIds || (serviceId ? [serviceId] : []);
    
    if (servicesToBook.length === 0) {
      return NextResponse.json({ error: 'Nenhum serviço selecionado' }, { status: 400 });
    }

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
    
    // 2. Verificar se todos os horários necessários estão livres
    for (let i = 0; i < servicesToBook.length; i++) {
      const [h, m] = time.split(':').map(Number);
      const totalMins = h * 60 + m + i * 30;
      const nextH = Math.floor(totalMins / 60);
      const nextM = totalMins % 60;
      const nextTime = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;

      const existingAppointment = await db.get(
        "SELECT id FROM appointments WHERE professional_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'cancelled'",
        [professionalId, date, nextTime]
      );
      
      if (existingAppointment) {
        return NextResponse.json({ error: `O horário ${nextTime} já está reservado` }, { status: 400 });
      }
    }
    
    // 3. Criar os agendamentos (um para cada serviço, em horários sequenciais)
    let lastAppointmentId = null;
    for (let i = 0; i < servicesToBook.length; i++) {
      const sId = servicesToBook[i];
      const [h, m] = time.split(':').map(Number);
      const totalMins = h * 60 + m + i * 30;
      const nextH = Math.floor(totalMins / 60);
      const nextM = totalMins % 60;
      const nextTime = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;

      const appointmentResult = await db.run(
        'INSERT INTO appointments (client_id, professional_id, service_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?)',
        [clientId, professionalId, sId, date, nextTime, 'pending']
      );
      lastAppointmentId = appointmentResult.lastID;
    }
    
    return NextResponse.json({ success: true, appointmentId: lastAppointmentId, isExistingClient: !!existingClient });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Erro ao criar agendamento', stack: error.stack }, { status: 500 });
  }
}
