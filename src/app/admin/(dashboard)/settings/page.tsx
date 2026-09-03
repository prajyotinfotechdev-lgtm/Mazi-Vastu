import PushNotificationToggle from '@/components/admin/PushNotificationToggle';

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

        <section className="mv-card">
          <p style={{ color: 'var(--mv-text-secondary)', margin: 0 }}>
            More settings coming soon!
          </p>
        </section>
      </div>
    </div>
  );
}
