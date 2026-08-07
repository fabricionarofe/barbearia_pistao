'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Scissors, User, Phone, CheckCircle, ChevronRight, ArrowLeft, Camera, Share2, Globe, Utensils } from 'lucide-react';
import '../globals.css';

// Helper para formatar data YYYY-MM-DD no fuso horário local (evita bug de UTC mudar o dia após às 21h)
function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [clientData, setClientData] = useState({ name: '', phone: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExistingClient, setIsExistingClient] = useState(false);
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [storeStatus, setStoreStatus] = useState('open');
  const [returnTime, setReturnTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);

  // Expediente individual do profissional selecionado
  const [profSchedules, setProfSchedules] = useState([]);

  const fetchInitialData = async () => {
    setIsLoadingData(true);
    try {
      const timestamp = new Date().getTime();
      const [servicesData, professionalsData, settingsData, statusData] = await Promise.all([
        fetch(`/api/services?t=${timestamp}`, { cache: 'no-store', headers: { 'ngrok-skip-browser-warning': 'true' } }).then(res => res.json()),
        fetch(`/api/professionals?t=${timestamp}`, { cache: 'no-store', headers: { 'ngrok-skip-browser-warning': 'true' } }).then(res => res.json()),
        fetch(`/api/settings?t=${timestamp}`, { cache: 'no-store', headers: { 'ngrok-skip-browser-warning': 'true' } }).then(res => res.json()),
        fetch(`/api/settings/status?t=${timestamp}`, { cache: 'no-store', headers: { 'ngrok-skip-browser-warning': 'true' } }).then(res => res.json())
      ]);

      if (Array.isArray(servicesData)) setServices(servicesData);
      if (Array.isArray(professionalsData)) setProfessionals(professionalsData);
      if (settingsData) {
        setSiteSettings(settingsData);
        if (settingsData.site_theme?.primary_color) {
          document.documentElement.style.setProperty('--primary', settingsData.site_theme.primary_color);
        }
      }
      if (statusData) {
        setStoreStatus(statusData.store_status || 'open');
        setReturnTime(statusData.return_time || '');
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Gerar próximas 7 datas usando o fuso horário local correto
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return getLocalDateString(d);
    });
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, []);

  // Buscar expedientes do profissional quando for selecionado
  useEffect(() => {
    if (selectedProfessional) {
      setIsLoadingSchedules(true);
      const timestamp = new Date().getTime();
      fetch(`/api/schedules?professional_id=${selectedProfessional.id}&t=${timestamp}`, { cache: 'no-store', headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProfSchedules(data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingSchedules(false));
    }
  }, [selectedProfessional]);

  // Filtrar profissionais que oferecem TODOS os serviços selecionados (ou se não houver restrição)
  const availableProfessionals = professionals.filter(prof => {
    if (!prof.service_ids || prof.service_ids.length === 0) return true;
    return selectedServices.every(s => prof.service_ids.includes(s.id));
  });

  const getServiceImage = (name) => {
    if (!name) return null;
    const n = name.toLowerCase();

    if (n.includes('moicano') && (n.includes('degrade') || n.includes('degradê'))) return '/img/moicano degradê.jpeg';
    if (n.includes('moicano')) return '/img/moicano.jpeg';
    if (n.includes('navalhado')) return '/img/navalhado.jpeg';
    if (n.includes('social')) return '/img/social.jpeg';
    if (n.includes('americano')) return '/img/americano.jpeg';
    if (n.includes('barba')) return '/img/barba.jpeg';
    if (n.includes('degrade') || n.includes('degradê')) return '/img/degrade na 0.jpeg';
    if (n.includes('luzes')) return '/img/luzes.jpeg';
    if (n.includes('nevou')) return '/img/nevou.jpeg';
    if (n.includes('pigment')) return '/img/pigmentação.jpeg';
    if (n.includes('sobrancelha')) return '/img/sobrancelha.jpeg';

    return null;
  };

  // Gerar horários dinamicamente baseado na data e Expediente Individual do Profissional
  useEffect(() => {
    if (!selectedDate || !selectedProfessional) return;

    // Converter string YYYY-MM-DD em ano, mês (0-11), dia local sem fuso UTC
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Segunda... 6 = Sábado

    // Obter expediente do profissional para esse dia
    const daySchedule = profSchedules.find(s => Number(s.day_of_week) === Number(dayOfWeek));

    // Se o expediente estiver inativo/fechado para o profissional nesse dia
    if (daySchedule && (Number(daySchedule.is_active) === 0 || daySchedule.is_active === false)) {
      setAvailableTimes([]);
      return;
    }

    const startTime = daySchedule?.start_time || '09:00';
    const endTime = daySchedule?.end_time || '19:00';

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const times = [];
    const now = new Date();
    const todayStr = getLocalDateString(now);
    const isToday = selectedDate === todayStr;

    let minHour = startH;
    let minMinute = startM;

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

      if (baseHour > minHour || (baseHour === minHour && baseMin > minMinute)) {
        minHour = baseHour;
        minMinute = baseMin;
      }
    }

    for (let h = startH; h <= endH; h++) {
      for (const minuteVal of [0, 30]) {
        if (h === endH && minuteVal > endM) continue;

        const timeStr = `${h.toString().padStart(2, '0')}:${minuteVal.toString().padStart(2, '0')}`;
        const isPast = isToday && (h < minHour || (h === minHour && minuteVal < minMinute));

        if (!isPast) {
          times.push(timeStr);
        }
      }
    }

    setAvailableTimes(times);
  }, [selectedDate, selectedProfessional, profSchedules, storeStatus, returnTime]);

  // Buscar agendamentos já ocupados para a data e profissional
  useEffect(() => {
    if (selectedDate && selectedProfessional) {
      const timestamp = new Date().getTime();
      fetch(`/api/appointments?date=${selectedDate}&t=${timestamp}`, { cache: 'no-store', headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const times = data
              .filter(a => Number(a.professional_id) === Number(selectedProfessional.id) && a.status !== 'cancelled')
              .map(a => a.appointment_time);
            setOccupiedTimes(times);
          }
        })
        .catch(console.error);
    }
  }, [selectedDate, selectedProfessional]);

  const handleNextStep = () => {
    if (step === 1 && selectedServices.length === 0) return alert('Selecione um ou mais serviços!');
    if (step === 2 && !selectedProfessional) return alert('Selecione um profissional!');
    if (step === 3 && (!selectedDate || !selectedTime)) return alert('Selecione data e horário!');
    setStep(step + 1);
  };

  const handlePrevStep = () => setStep(step - 1);

  const toggleService = (service) => {
    setSelectedServices(prev => {
      if (prev.find(s => s.id === service.id)) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

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
          serviceIds: selectedServices.map(s => s.id),
          date: selectedDate,
          time: selectedTime
        })
      });

      if (res.ok) {
        const responseData = await res.json();
        setIsExistingClient(responseData.isExistingClient);
        setStep(5);
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

  const primaryColor = siteSettings?.site_theme?.primary_color || '#EAB308';
  const logoUrl = siteSettings?.site_theme?.logo_url || '/img/logo.jpeg';
  const todayStr = getLocalDateString(new Date());

  return (
    <div className="client-container" style={{ '--primary': primaryColor }}>
      <header className="client-header" style={{ paddingTop: '2rem' }}>
        <div className="logo-icon large" style={{ background: 'transparent', padding: 0, overflow: 'hidden' }}>
          <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
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
                    className={`option-card ${selectedServices.some(s => s.id === service.id) ? 'selected' : ''}`}
                    onClick={() => toggleService(service)}
                    style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}
                  >
                    <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={getServiceImage(service.name) || logoUrl}
                        alt={service.name}
                        onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{ display: 'none', color: 'var(--muted)' }}>
                        <Scissors size={24} />
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="option-header">
                        <h3>{service.name}</h3>
                        <span className="price">R$ {Number(service.price).toFixed(2)}</span>
                      </div>
                      {service.description && <p className="description">{service.description}</p>}
                      <div className="duration">
                        <Clock size={14} /> {service.duration_minutes} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary w-full mt-4" onClick={handleNextStep} style={{ opacity: selectedServices.length > 0 ? 1 : 0.5 }} disabled={isLoadingData || selectedServices.length === 0}>
              Continuar <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2: Profissionais (Filtrados pelos Serviços Habilitados no Admin) */}
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
                {availableProfessionals.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem 0' }}>
                    Nenhum profissional disponível para o(s) serviço(s) selecionado(s).
                  </p>
                ) : availableProfessionals.map(prof => (
                  <div
                    key={prof.id}
                    className={`option-card flex-center ${selectedProfessional?.id === prof.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProfessional(prof)}
                    style={{ padding: '1.25rem', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer' }}
                  >
                    <div className="avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(255,215,0,0.1)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {prof.photo_url ? (
                        <img src={prof.photo_url} alt={prof.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={36} style={{ color: 'var(--primary)' }} />
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{prof.name}</h3>
                    {prof.specialties && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', display: 'block' }}>
                        {prof.specialties}
                      </span>
                    )}
                    {prof.bio && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '6px', lineHeight: '1.3' }}>
                        {prof.bio}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button className="btn-primary w-full mt-4" onClick={handleNextStep} style={{ opacity: selectedProfessional ? 1 : 0.5 }} disabled={isLoadingData || !selectedProfessional}>
              Continuar <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 3: Data e Hora baseada no Expediente Individual do Barbeiro Escolhido */}
        {step === 3 && (
          <div className="step-container slide-in">
            <h2>3. Escolha Data e Horário</h2>

            <div className="date-selector">
              <p className="label">Data</p>
              <div className="date-scroll">
                {availableDates.map(date => {
                  const [y, m, d] = date.split('-').map(Number);
                  const dateObj = new Date(y, m - 1, d);
                  const isToday = date === todayStr;
                  const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
                  const dayNum = dateObj.getDate();

                  return (
                    <div
                      key={date}
                      className={`date-card ${selectedDate === date ? 'selected' : ''}`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <span className="weekday">{isToday ? 'Hoje' : weekday}</span>
                      <span className="day">{dayNum}</span>
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

            {selectedDate && storeStatus === 'lunch_break' && selectedDate === todayStr && (
              <div className="mt-4" style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'var(--card-bg)', border: '1px solid #eab308', borderRadius: '12px' }}>
                <p style={{ color: '#eab308', fontWeight: 'bold' }}>Estamos fechados para o almoço no momento.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>Mas você já pode agendar para os horários disponíveis mais tarde!</p>
              </div>
            )}

            {selectedDate && storeStatus !== 'closed' && (
              <div className="time-selector mt-4">
                <p className="label">Horários Disponíveis com {selectedProfessional?.name}</p>

                {isLoadingSchedules ? (
                  <div className="flex-center" style={{ padding: '2rem 0', flexDirection: 'column', color: 'var(--muted)' }}>
                    <div style={{ animation: 'spin 1s linear infinite', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', width: '24px', height: '24px' }} />
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Carregando horários do expediente...</p>
                  </div>
                ) : (
                  <div className="time-grid">
                    {availableTimes.length === 0 ? (
                      <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#ef4444', fontSize: '0.9rem', padding: '1rem', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
                        O profissional não atende nesta data.
                      </p>
                    ) : availableTimes.map(time => {
                      const [y, m, d] = selectedDate.split('-').map(Number);
                      const dateObj = new Date(y, m - 1, d);
                      const dayOfWeek = dateObj.getDay();
                      const daySchedule = profSchedules.find(s => Number(s.day_of_week) === Number(dayOfWeek));

                      const hasBreak = daySchedule && (Number(daySchedule.has_break) === 1 || daySchedule.has_break === true);
                      const breakStart = daySchedule?.break_start || '12:00';
                      const breakEnd = daySchedule?.break_end || '13:00';

                      // Verificar se o horário fica dentro do intervalo de almoço do barbeiro
                      const isLunch = hasBreak && time >= breakStart && time < breakEnd;
                      const isOccupied = occupiedTimes.includes(time);
                      const isValid = !isLunch && !isOccupied;

                      return (
                        <div
                          key={time}
                          className={`time-card flex-center ${selectedTime === time ? 'selected' : ''} ${!isValid ? 'occupied' : ''}`}
                          onClick={() => isValid && setSelectedTime(time)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: !isValid ? 0.6 : 1, padding: '0.5rem', cursor: isValid ? 'pointer' : 'not-allowed' }}
                        >
                          <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{time}</span>
                          {isLunch ? (
                            <span style={{ fontSize: '0.65rem', color: '#eab308', textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.05em' }}>Almoço</span>
                          ) : isOccupied ? (
                            <span style={{ fontSize: '0.65rem', color: '#ef4444', textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.05em' }}>Ocupado</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                    onChange={e => setClientData({ ...clientData, name: e.target.value })}
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
                    onChange={e => setClientData({ ...clientData, phone: e.target.value })}
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
            <p>Seu horário com <strong>{selectedProfessional.name}</strong> para <strong>{selectedServices.map(s => s.name).join(' + ')}</strong> foi reservado com sucesso.</p>
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

      {/* Footer com Redes Sociais */}
      {siteSettings?.social_links && (
        <footer style={{ marginTop: '3rem', padding: '1.5rem 0', textAlign: 'center', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            {siteSettings.social_links.instagram && (
              <a href={siteSettings.social_links.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--muted)' }}><Camera size={20} /></a>
            )}
            {siteSettings.social_links.facebook && (
              <a href={siteSettings.social_links.facebook} target="_blank" rel="noreferrer" style={{ color: 'var(--muted)' }}><Share2 size={20} /></a>
            )}
            {siteSettings.social_links.website && (
              <a href={siteSettings.social_links.website} target="_blank" rel="noreferrer" style={{ color: 'var(--muted)' }}><Globe size={20} /></a>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>© Barbearia do Paulo - Todos os direitos reservados</p>
        </footer>
      )}
    </div>
  );
}
