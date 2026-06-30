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

import { motion } from 'framer-motion';

export function PremiumAuthLayout({ children, eyebrow, title, description, features = [], tone = "customer" }) {
  const brandColors = {
    customer: 'var(--brand-customer)',
    restaurant: 'var(--brand-restaurant)',
    delivery: 'var(--brand-delivery)',
    admin: 'var(--brand-admin)',
  };
  const brandColor = brandColors[tone] || brandColors.customer;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      {/* Left pane: Marketing/Context (Hidden on mobile) */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--color-bg-card)',
        padding: 'var(--space-8) var(--space-6)',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRight: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden'
      }} className="auth-marketing-pane">
        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          {eyebrow && <p style={{ color: brandColor, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>{eyebrow}</p>}
          <h1 style={{ fontSize: 'var(--text-hero)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 'var(--space-4)' }}>{title}</h1>
          <p style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 'var(--space-7)' }}>{description}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {features.map((feature, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                <div style={{ width: 48, height: 48, borderRadius: '14px', backgroundColor: `${brandColor}15`, color: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <feature.icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-body)', fontWeight: 700, marginBottom: '4px' }}>{feature.title}</h3>
                  <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', margin: 0 }}>{feature.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right pane: Form area */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthProgress({ steps = [], current = 1, brandColor = 'var(--brand-customer)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-6)', justifyContent: 'center' }}>
      {steps.map((step, index) => {
        const isCompleted = index + 1 < current;
        const isActive = index + 1 === current;
        return (
          <React.Fragment key={step}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isActive ? 'auto' : '28px',
              padding: isActive ? '0 12px' : 0,
              height: '28px',
              borderRadius: '14px',
              backgroundColor: isActive || isCompleted ? brandColor : 'var(--color-divider)',
              color: isActive || isCompleted ? '#FFF' : 'var(--color-text-secondary)',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all 0.3s ease'
            }}>
              {isActive ? step : (isCompleted ? '✓' : index + 1)}
            </div>
            {index < steps.length - 1 && (
              <div style={{ width: '24px', height: '2px', backgroundColor: isCompleted ? brandColor : 'var(--color-divider)', transition: 'all 0.3s ease' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
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
