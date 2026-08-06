'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Upload, Share2, Camera, Globe, Video, MessageSquare, CheckCircle, Palette } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [siteTheme, setSiteTheme] = useState({
    primary_color: '#EAB308',
    logo_url: '/img/logo.jpeg',
    banner_url: ''
  });

  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    tiktok: '',
    youtube: '',
    website: '',
    twitter: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [bookingUrl, setBookingUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBookingUrl(`${window.location.origin}/agendar`);
    }

    fetch('/api/settings', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        if (data.site_theme) setSiteTheme(data.site_theme);
        if (data.social_links) setSocialLinks(data.social_links);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_theme: siteTheme,
          social_links: socialLinks
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Erro ao salvar configurações.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `💈 *Barbearia* - Agende seu horário de forma rápida e fácil acessando nosso link:\n${bookingUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <>
      <div className="page-header flex justify-between align-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Configurações Avançadas</h1>
          <p>Personalize o visual do site, redes sociais e links de agendamento</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          {saveSuccess ? (
            <>
              <CheckCircle size={18} /> Salvo!
            </>
          ) : (
            <>
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="panel-card mt-4 empty-state">
          <p>Carregando configurações...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '750px' }}>
          {/* Seção 1: Visual e Branding */}
          <div className="panel-card mt-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={20} style={{ color: 'var(--primary)' }} /> Personalização Visual
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              Imagens e cores do site público do cliente
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Logo */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Logo da Barbearia (recomendado: 512×512px, quadrado)
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '12px', backgroundColor: '#1a1a1a', border: '1px solid var(--card-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {siteTheme.logo_url ? (
                      <img src={siteTheme.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Upload size={24} style={{ color: 'var(--muted)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <input
                      type="text"
                      placeholder="URL da logo (/img/logo.jpeg)"
                      value={siteTheme.logo_url}
                      onChange={e => setSiteTheme({ ...siteTheme, logo_url: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                    />
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Banner do Site (recomendado: 1920×480px, proporção 4:1)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {siteTheme.banner_url && (
                    <div style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--card-border)' }}>
                      <img src={siteTheme.banner_url} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="URL do banner de capa"
                    value={siteTheme.banner_url}
                    onChange={e => setSiteTheme({ ...siteTheme, banner_url: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                  />
                </div>
              </div>

              {/* Cor Primária */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Cor Principal do Site
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={siteTheme.primary_color || '#EAB308'}
                    onChange={e => setSiteTheme({ ...siteTheme, primary_color: e.target.value })}
                    style={{ width: '50px', height: '42px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                  />
                  <input
                    type="text"
                    value={siteTheme.primary_color || '#EAB308'}
                    onChange={e => setSiteTheme({ ...siteTheme, primary_color: e.target.value })}
                    style={{ width: '120px', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white', fontWeight: 'bold' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Redes Sociais */}
          <div className="panel-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={20} style={{ color: 'var(--primary)' }} /> Redes Sociais
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              Links para suas redes sociais (exibidos no site público)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Instagram */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#e1306c' }}>
                  <Camera size={16} /> Instagram
                </label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/suabarbearia"
                  value={socialLinks.instagram || ''}
                  onChange={e => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
              </div>

              {/* Facebook */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#1877f2' }}>
                  <Share2 size={16} /> Facebook
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/suabarbearia"
                  value={socialLinks.facebook || ''}
                  onChange={e => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
              </div>

              {/* TikTok */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#00f2fe' }}>
                  <Video size={16} /> TikTok
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@suabarbearia"
                  value={socialLinks.tiktok || ''}
                  onChange={e => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
              </div>

              {/* YouTube */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#ff0000' }}>
                  <Video size={16} /> YouTube
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@suabarbearia"
                  value={socialLinks.youtube || ''}
                  onChange={e => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
              </div>

              {/* Website */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#3b82f6' }}>
                  <Globe size={16} /> Website
                </label>
                <input
                  type="url"
                  placeholder="https://suabarbearia.com.br"
                  value={socialLinks.website || ''}
                  onChange={e => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
              </div>

              {/* X (Twitter) */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: '#1da1f2' }}>
                  <MessageSquare size={16} /> X (Twitter)
                </label>
                <input
                  type="url"
                  placeholder="https://x.com/suabarbearia"
                  value={socialLinks.twitter || ''}
                  onChange={e => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Link e Botão WhatsApp */}
          <div className="panel-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={20} style={{ color: 'var(--primary)' }} /> Link de Agendamento
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              Compartilhe o link direto para os seus clientes realizarem agendamentos
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                readOnly
                value={bookingUrl}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'var(--primary)', fontWeight: 'bold' }}
              />

              <button
                onClick={handleShareWhatsApp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '10px',
                  backgroundColor: '#25D366',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                }}
              >
                <Share2 size={20} /> Compartilhar Link no WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
