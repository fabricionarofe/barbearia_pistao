'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Scissors, User, Phone, CheckCircle, ChevronRight, ArrowLeft, Menu } from 'lucide-react';
import '../globals.css';

export default function Home() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [selectedService, setSelectedService] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [clientData, setClientData] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExistingClient, setIsExistingClient] = useState(false);
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [showFab, setShowFab] = useState(false);
  const [storeStatus, setStoreStatus] = useState('open');
  const [returnTime, setReturnTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);

  useEffect(() => {
    // Buscar serviços e profissionais reais da API
    Promise.all([
      fetch('/api/services', { headers: { 'ngrok-skip-browser-warning': 'true' } }).then(res => res.json()),
      fetch('/api/professionals', { headers: { 'ngrok-skip-browser-warning': 'true' } }).then(res => res.json())
    ]).then(([servicesData, professionalsData]) => {
      if (servicesData && servicesData.length > 0) setServices(servicesData);
      if (professionalsData && professionalsData.length > 0) setProfessionals(professionalsData);
    }).catch(console.error)
      .finally(() => setIsLoadingData(false));
    
    // Fetch store status
    fetch('/api/settings/status', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        setStoreStatus(data.store_status || 'open');
        setReturnTime(data.return_time || '');
      })
      .catch(() => setStoreStatus('open'));

    // Gerar datas apenas no lado do cliente para evitar erro de Hidratação
    setAvailableDates(Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    }));
  }, []);

  // Gerar horários dinamicamente baseado na data e se está aberta
  useEffect(() => {
    if (!selectedDate) return;
    
    const times = [];
    let startHour = 9; // 09:00
    let startMin = 0;
    
    const now = new Date();
    // A data selecionada vem no formato YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === todayStr;

    if (isToday) {
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      let baseHour = currentHour;
      let baseMin = currentMin <= 30 ? 30 : 60;
      
      if (baseMin === 60) {
        baseHour += 1;
        baseMin = 0;
      }
      
      if (['lunch_break', 'emergency'].includes(storeStatus) && returnTime) {
        const [retHour, retMin] = returnTime.split(':').map(Number);
        if (retHour > baseHour || (retHour === baseHour && retMin > baseMin)) {
          baseHour = retHour;
          baseMin = retMin;
        }
      }
      
      startHour = baseHour;
      startMin = baseMin;
    }

    for (let h = 9; h <= 20; h++) {
      const t1 = `${h.toString().padStart(2, '0')}:00`;
      const t2 = `${h.toString().padStart(2, '0')}:30`;
      
      const isPastT1 = h < startHour || (h === startHour && 0 < startMin);
      const isPastT2 = h < startHour || (h === startHour && 30 < startMin);
      
      // Mostrar se: Não for hoje, OU não tiver passado, OU estiver agendado
      if (!isToday || !isPastT1 || occupiedTimes.includes(t1)) {
        times.push(t1);
      }
      if (h < 20 && (!isToday || !isPastT2 || occupiedTimes.includes(t2))) {
        times.push(t2);
      }
    }
    
    setAvailableTimes(times);
  }, [selectedDate, storeStatus, returnTime, occupiedTimes]);

  useEffect(() => {
    if (selectedDate && selectedProfessional) {
      fetch(`/api/appointments?date=${selectedDate}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const times = data
              .filter(a => a.professional_id === selectedProfessional.id && a.status !== 'cancelled')
              .map(a => a.appointment_time);
            setOccupiedTimes(times);
          }
        })
        .catch(console.error);
    }
  }, [selectedDate, selectedProfessional]);

  const handleNextStep = () => {
    if (step === 1 && !selectedService) return alert('Selecione um serviço!');
    if (step === 2 && !selectedProfessional) return alert('Selecione um profissional!');
    if (step === 3 && (!selectedDate || !selectedTime)) return alert('Selecione data e horário!');
    setStep(step + 1);
  };

  const handlePrevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientData.name || !clientData.phone) return alert('Nome e WhatsApp são obrigatórios!');
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        },
        body: JSON.stringify({
          clientName: clientData.name,
          clientPhone: clientData.phone,
          clientEmail: clientData.email,
          professionalId: selectedProfessional.id,
          serviceId: selectedService.id,
          date: selectedDate,
          time: selectedTime
        })
      });
      
      if (res.ok) {
        const responseData = await res.json();
        setIsExistingClient(responseData.isExistingClient);
        setStep(5); // Sucesso
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Erro ao agendar.');
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="client-container">
      <header className="client-header">
        <div className="logo-icon large">
          <Scissors size={32} />
        </div>
        <div>
          <h1>Barbearia do Paulo</h1>
          <p>Agende seu horário de forma rápida e fácil.</p>
        </div>
      </header>

      <main className="client-main">
        {step > 1 && step < 5 && (
          <button className="back-button" onClick={handlePrevStep}>
            <ArrowLeft size={20} /> Voltar
          </button>
        )}

        {/* STEP 1: Serviços */}
        {step === 1 && (
          <div className="step-container slide-in">
            <h2>1. Escolha o Serviço</h2>
            {isLoadingData ? (
              <div className="flex-center" style={{ padding: '3rem 0', flexDirection: 'column', color: 'var(--muted)' }}>
                <div style={{ animation: 'spin 1s linear infinite', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', width: '32px', height: '32px' }} />
                <p>Carregando serviços...</p>
              </div>
            ) : (
              <div className="options-grid">
                {services.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem 0' }}>Nenhum serviço disponível no momento.</p>
                ) : services.map(service => (
                  <div 
                    key={service.id} 
                    className={`option-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                    onClick={() => setSelectedService(service)}
                  >
                    <div className="option-header">
                      <h3>{service.name}</h3>
                      <span className="price">R$ {service.price.toFixed(2)}</span>
                    </div>
                    <p className="description">{service.description}</p>
                    <div className="duration">
                      <Clock size={14} /> {service.duration_minutes} min
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary w-full mt-4" onClick={handleNextStep} style={{ opacity: selectedService ? 1 : 0.5 }} disabled={isLoadingData || !selectedService}>
              Continuar <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: Profissionais */}
        {step === 2 && (
          <div className="step-container slide-in">
            <h2>2. Escolha o Profissional</h2>
            {isLoadingData ? (
              <div className="flex-center" style={{ padding: '3rem 0', flexDirection: 'column', color: 'var(--muted)' }}>
                <div style={{ animation: 'spin 1s linear infinite', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', width: '32px', height: '32px' }} />
                <p>Carregando profissionais...</p>
              </div>
            ) : (
              <div className="options-grid">
                {professionals.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem 0' }}>Nenhum profissional disponível no momento.</p>
                ) : professionals.map(prof => (
                  <div 
                    key={prof.id} 
                    className={`option-card flex-center ${selectedProfessional?.id === prof.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProfessional(prof)}
                  >
                    <div className="avatar">
                      <User size={32} />
                    </div>
                    <h3>{prof.name}</h3>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary w-full mt-4" onClick={handleNextStep} style={{ opacity: selectedProfessional ? 1 : 0.5 }} disabled={isLoadingData || !selectedProfessional}>
              Continuar <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 3: Data e Hora */}
        {step === 3 && (
          <div className="step-container slide-in">
            <h2>3. Escolha Data e Horário</h2>
            
            <div className="date-selector">
              <p className="label">Data</p>
              <div className="date-scroll">
                {availableDates.map(date => {
                  const d = new Date(date + 'T00:00:00');
                  const isToday = new Date().toISOString().split('T')[0] === date;
                  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
                  const day = d.getDate();
                  
                  return (
                    <div 
                      key={date} 
                      className={`date-card ${selectedDate === date ? 'selected' : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span className="weekday">{isToday ? 'Hoje' : weekday}</span>
                      <span className="day">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDate && storeStatus === 'closed' && (
              <div className="mt-4" style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--card-bg)', border: '1px solid #ef4444', borderRadius: '12px' }}>
                <p style={{ color: '#ef4444', fontWeight: 'bold' }}>A barbearia está fechada no momento.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Por favor, retorne mais tarde para realizar seu agendamento.</p>
              </div>
            )}
            
            {selectedDate && storeStatus === 'lunch_break' && isToday && (
              <div className="mt-4" style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--card-bg)', border: '1px solid #eab308', borderRadius: '12px' }}>
                <p style={{ color: '#eab308', fontWeight: 'bold' }}>Estamos em pausa para o almoço.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Retornaremos e os horários estarão disponíveis a partir das <strong>{returnTime}</strong>.</p>
              </div>
            )}
            
            {selectedDate && storeStatus === 'emergency' && isToday && (
              <div className="mt-4" style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--card-bg)', border: '1px solid #f97316', borderRadius: '12px' }}>
                <p style={{ color: '#f97316', fontWeight: 'bold' }}>Tivemos um pequeno imprevisto.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Retornaremos e os horários estarão disponíveis a partir das <strong>{returnTime}</strong>.</p>
              </div>
            )}

            {selectedDate && storeStatus !== 'closed' && (
              <div className="time-selector mt-4">
                <p className="label">Horários Disponíveis</p>
                <div className="time-grid">
                  {availableTimes.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum horário disponível para hoje.</p>
                  ) : availableTimes.map(time => {
                    const isOccupied = occupiedTimes.includes(time);
                    return (
                      <div 
                        key={time} 
                        className={`time-card flex-center ${selectedTime === time ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                        onClick={() => !isOccupied && setSelectedTime(time)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {isOccupied ? <span style={{ fontSize: '0.75rem', lineHeight: '1' }}>Horário<br/>indisponível</span> : time}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button className="btn-primary w-full mt-4" onClick={handleNextStep} style={{ opacity: (selectedDate && selectedTime) ? 1 : 0.5 }} disabled={!selectedDate || !selectedTime || storeStatus === 'closed'}>
              Continuar <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 4: Dados do Cliente */}
        {step === 4 && (
          <div className="step-container slide-in">
            <h2>4. Seus Dados</h2>
            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-group">
                <label>Nome Completo *</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input 
                    type="text" 
                    placeholder="Ex: João da Silva" 
                    value={clientData.name}
                    onChange={e => setClientData({...clientData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>WhatsApp *</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input 
                    type="tel" 
                    placeholder="(00) 00000-0000" 
                    value={clientData.phone}
                    onChange={e => setClientData({...clientData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 5: Sucesso */}
        {step === 5 && (
          <div className="step-container slide-in success-state">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h2>{isExistingClient ? 'Achei seu Perfil! 🎉' : 'Agendamento Confirmado!'}</h2>
            <p>Seu horário com <strong>{selectedProfessional.name}</strong> para <strong>{selectedService.name}</strong> foi reservado com sucesso.</p>
            <div className="success-details">
              <div className="detail-row">
                <Calendar size={18} /> 
                <span>{selectedDate.split('-').reverse().join('/')} às {selectedTime}</span>
              </div>
            </div>
            <button className="btn-secondary mt-4" onClick={() => window.location.reload()}>
              Fazer novo agendamento
            </button>
          </div>
        )}
      </main>


    </div>
  );
}
