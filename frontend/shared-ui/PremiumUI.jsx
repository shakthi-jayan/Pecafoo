// Phase 0: Design System Barrel Export

export * from './components/Layout';
export * from './components/Actions';
export * from './components/Inputs';
export * from './components/Navigation';
export * from './components/Feedback';
export * from './components/DataDisplay';

// Legacy Wrappers (To prevent immediate crashes before Phase 1)
import { HeroBanner, SectionHeader as NewSectionHeader } from './components/Layout';
import { MetricCard as DataMetricCard, Avatar, HorizontalScroller, MetricCard as NewMetricCard, ProfileHeader } from './components/DataDisplay';

export function PremiumAuthLayout({ children, ...props }) {
  return <div className="legacy-premium-auth-layout">{children}</div>;
}

export function AuthProgress({ steps, current }) {
  return <div className="legacy-auth-progress">Step {current} of {steps?.length}</div>;
}

export function PageHero(props) {
  return <HeroBanner {...props} />;
}

export const ContentShelf = HorizontalScroller;

export function ProfileHero({ initials, name, subtitle }) {
  return <ProfileHeader name={name} subtitle={subtitle} avatarInitials={initials} />;
}

export function SettingsGroup({ title, description, children }) {
  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      <NewSectionHeader title={title} description={description} />
      <div style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

export function SettingsRow({ icon: Icon, title, subtitle, onClick }) {
  return (
    <div onClick={onClick} style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', cursor: onClick ? 'pointer' : 'default', borderBottom: '1px solid var(--color-border)' }}>
      {Icon && <Icon size={24} />}
      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        {subtitle && <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>{subtitle}</div>}
      </div>
    </div>
  );
}
