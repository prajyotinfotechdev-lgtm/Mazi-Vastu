import PushNotificationToggle from '@/components/admin/PushNotificationToggle';
import SiteSettingsForm from '@/components/admin/SiteSettingsForm';

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="mv-heading-xl" style={{ marginBottom: '2rem' }}>
        Settings
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--mv-text)' }}>
            Notifications
          </h2>
          <PushNotificationToggle />
        </section>

        <section className="mv-card" style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--mv-text)', paddingBottom: '0.75rem', borderBottom: '1px solid var(--mv-border)' }}>
            Site Settings & Contact Info
          </h2>
          <SiteSettingsForm />
        </section>
      </div>
    </div>
  );
}
