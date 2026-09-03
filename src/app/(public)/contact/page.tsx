import { getLanguage } from '@/lib/i18n/get-language';
import ConsultationForm from '@/components/public/ConsultationForm';
import { MapPin, Phone, Mail } from 'lucide-react';

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

export default function ContactPage() {
  const lang = getLanguage();
  const t = tr[lang] || tr.en;

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

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: 'clamp(1.5rem, 4vw, 3rem)', 
          alignItems: 'start', 
          '@media (min-width: 1024px)': { gridTemplateColumns: '1.5fr 1fr' } 
        } as React.CSSProperties}>
          
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

          {/* Info Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem, 4vw, 2rem)' }}>
            <div style={{ 
              background: 'linear-gradient(180deg, var(--mv-bg-elevated) 0%, rgba(20,20,20,1) 100%)', 
              border: '1px solid rgba(255, 255, 255, 0.06)', 
              borderTop: '1px solid rgba(245, 197, 24, 0.3)',
              color: 'var(--mv-text)', 
              padding: 'clamp(1.5rem, 5vw, 3rem)', 
              borderRadius: 'clamp(16px, 4vw, 24px)',
              boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
            }}>
              <h3 style={{ 
                fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
                fontWeight: 700,
                marginBottom: 'clamp(1.5rem, 4vw, 2rem)', 
                color: 'var(--mv-text)',
                fontFamily: 'Outfit, sans-serif'
              }}>
                {t.contactInfo}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem, 4vw, 2rem)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.2) 0%, rgba(245, 197, 24, 0.05) 100%)', 
                    padding: 'clamp(0.75rem, 2vw, 1rem)', 
                    borderRadius: '16px',
                    border: '1px solid rgba(245, 197, 24, 0.2)',
                    flexShrink: 0
                  }}>
                    <MapPin size={24} color="var(--mv-accent)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Office Address</div>
                    <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', lineHeight: 1.5, color: 'var(--mv-text)', wordBreak: 'break-word' }}>{t.address}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.2) 0%, rgba(245, 197, 24, 0.05) 100%)', 
                    padding: 'clamp(0.75rem, 2vw, 1rem)', 
                    borderRadius: '16px',
                    border: '1px solid rgba(245, 197, 24, 0.2)',
                    flexShrink: 0
                  }}>
                    <Phone size={24} color="var(--mv-accent)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Support</div>
                    <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', lineHeight: 1.5, color: 'var(--mv-text)' }}>{t.phone}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(245, 197, 24, 0.2) 0%, rgba(245, 197, 24, 0.05) 100%)', 
                    padding: 'clamp(0.75rem, 2vw, 1rem)', 
                    borderRadius: '16px',
                    border: '1px solid rgba(245, 197, 24, 0.2)',
                    flexShrink: 0
                  }}>
                    <Mail size={24} color="var(--mv-accent)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                    <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', lineHeight: 1.5, color: 'var(--mv-text)', wordBreak: 'break-all' }}>{t.email}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ 
              borderRadius: 'clamp(16px, 4vw, 24px)', 
              overflow: 'hidden', 
              height: '300px', 
              background: 'var(--mv-bg-surface)', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
            }}>
              {/* Placeholder for map */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d121058.92836561578!2d73.79292695574044!3d18.524766326629938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(1.1) brightness(0.9)' }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
