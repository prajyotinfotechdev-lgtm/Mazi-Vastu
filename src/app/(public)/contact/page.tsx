import { getLanguage } from '@/lib/i18n/get-language';
import ConsultationForm from '@/components/public/ConsultationForm';
import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, UserCircle, MessageCircle, Linkedin, Send } from 'lucide-react';
import { prisma } from '@/lib/db/prisma';

export const metadata = {
  title: 'Contact & Consultation | MaziVastu',
  description: 'Get in touch with our experts for property consultation, buying, selling, or renting.',
};

const tr: Record<string, Record<string, string>> = {
  en: {
    title: 'Book a Consultation',
    subtitle: 'Looking for the perfect property or need expert real estate advice? Fill out the form below and our dedicated agents will get in touch with you shortly.',
    contactInfo: 'Contact Information',
    address: '123 Real Estate Avenue, Pune, Maharashtra 411001',
    phone: '+91 98765 43210',
    email: 'contact@mazivastu.com'
  },
  mr: {
    title: 'सल्लामसलत बुक करा',
    subtitle: 'परिपूर्ण मालमत्ता शोधत आहात किंवा रिअल इस्टेट सल्ल्याची आवश्यकता आहे? खालील फॉर्म भरा आणि आमचे एजंट लवकरच तुमच्याशी संपर्क साधतील.',
    contactInfo: 'संपर्क माहिती',
    address: '१२३ रिअल इस्टेट अव्हेन्यू, पुणे, महाराष्ट्र ४११००१',
    phone: '+९१ ९८७६५ ४३२१०',
    email: 'contact@mazivastu.com'
  }
};

export default async function ContactPage() {
  const lang = getLanguage();
  const t = tr[lang] || tr.en;

  // Fetch dynamic site settings
  let settings = null;
  try {
    settings = await prisma.siteSettings.findFirst();
  } catch (error) {
    console.error('Error fetching site settings:', error);
  }

  const founderName = settings?.founderName || 'Kishor Lavte';
  const founderImage = settings?.founderImage || '';
  const address = settings?.officeAddress || t.address;
  const phone = settings?.phone || t.phone;
  const email = settings?.email || t.email;
  const disclosure = settings?.disclosure || '';
  const insta = settings?.instagramUrl || '';
  const fb = settings?.facebookUrl || '';
  const yt = settings?.youtubeUrl || '';
  const wa = settings?.whatsappUrl || '';
  const li = settings?.linkedinUrl || '';
  const tg = settings?.telegramUrl || '';

  return (
    <main style={{
      background: 'var(--mv-bg)',
      minHeight: '100vh',
      padding: 'clamp(2rem, 8vw, 4rem) 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(600px, 100vw)',
        height: 'min(600px, 100vw)',
        background: 'radial-gradient(circle, rgba(245, 197, 24, 0.1) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <div className="mv-container" style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 'clamp(2rem, 5vw, 3rem)' }}>

        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3rem)',
            fontWeight: 800,
            color: 'var(--mv-text)',
            marginBottom: '1rem',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            {t.title}
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
            color: 'var(--mv-text-secondary)',
            lineHeight: 1.6
          }}>
            {t.subtitle}
          </p>
        </div>

        <div className="mv-contact-layout">
          <style dangerouslySetInnerHTML={{
            __html: `
              .mv-contact-layout {
                display: grid;
                grid-template-columns: 1fr;
                gap: clamp(1.5rem, 4vw, 3rem);
                align-items: start;
              }
              @media (min-width: 1024px) {
                .mv-contact-layout {
                  grid-template-columns: 1fr 1.5fr;
                }
              }
            `
          }} />

          {/* Dynamic Info Section (Founder & Contact) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(1.5rem, 4vw, 2rem)',
            background: 'linear-gradient(180deg, var(--mv-bg-elevated) 0%, rgba(20,20,20,1) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderTop: '1px solid rgba(245, 197, 24, 0.3)',
            padding: 'clamp(1.5rem, 5vw, 3rem)',
            borderRadius: 'clamp(16px, 4vw, 24px)',
            boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
          }}>
            <h3 style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: 700,
              marginBottom: '1rem',
              color: 'var(--mv-text)',
              fontFamily: 'Outfit, sans-serif'
            }}>
              {t.contactInfo}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr',
              gap: '2rem',
              alignItems: 'start'
            }} className="mv-contact-details-inner">
              <style dangerouslySetInnerHTML={{
                __html: `
                  @media (max-width: 480px) {
                    .mv-contact-details-inner {
                      grid-template-columns: 1fr !important;
                      text-align: center;
                    }
                  }
                `
              }} />

              {/* Founder Area */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid var(--mv-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)'
                }}>
                  {founderImage ? (
                    <img src={founderImage} alt={founderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <UserCircle size={48} color="var(--mv-accent)" />
                  )}
                </div>
                <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Founder</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mv-text)' }}>{founderName}</div>
                </div>
              </div>

              {/* Details Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mv-accent)', marginBottom: '0.25rem' }}>Office Address</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--mv-text-secondary)', lineHeight: 1.5, wordBreak: 'break-word', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <MapPin size={16} color="var(--mv-text-muted)" style={{ marginTop: '3px', flexShrink: 0 }} />
                    <span>{address}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mv-accent)', marginBottom: '0.25rem' }}>Contact</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--mv-text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Phone size={14} color="var(--mv-text-muted)" /> {phone}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--mv-text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Mail size={14} color="var(--mv-text-muted)" /> {email}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Disclosure */}
            {disclosure && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: 'var(--mv-text-muted)'
              }}>
                <strong style={{ color: 'var(--mv-text)' }}>Disclosure:</strong> {disclosure}
              </div>
            )}

            {/* Follow Us */}
            {(insta || fb || yt || wa || li || tg) && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mv-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Follow Us</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mv-text-secondary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#25D366'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--mv-text-secondary)'}>
                      <MessageCircle size={24} />
                    </a>
                  )}
                  {insta && (
                    <a href={insta} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mv-text-secondary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#E1306C'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--mv-text-secondary)'}>
                      <Instagram size={24} />
                    </a>
                  )}
                  {fb && (
                    <a href={fb} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mv-text-secondary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#1877F2'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--mv-text-secondary)'}>
                      <Facebook size={24} />
                    </a>
                  )}
                  {yt && (
                    <a href={yt} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mv-text-secondary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FF0000'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--mv-text-secondary)'}>
                      <Youtube size={24} />
                    </a>
                  )}
                  {li && (
                    <a href={li} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mv-text-secondary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#0A66C2'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--mv-text-secondary)'}>
                      <Linkedin size={24} />
                    </a>
                  )}
                  {tg && (
                    <a href={tg} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--mv-text-secondary)', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#0088cc'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--mv-text-secondary)'}>
                      <Send size={24} />
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Form Section */}
          <div style={{
            background: 'var(--mv-bg-elevated)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'clamp(16px, 4vw, 24px)',
            padding: 'clamp(1.5rem, 5vw, 4rem)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.8)',
          }}>
            <ConsultationForm lang={lang} />
          </div>

        </div>
      </div>
    </main>
  );
}
