export function PremiumAuthLayout({ brand = 'Pecafoo', eyebrow, title, description, features = [], tone, children }) {
  return (
    <main className={`premium-auth ${tone ? `premium-auth--${tone}` : ''}`}>
      <section className="premium-auth-story" aria-label={`${brand} introduction`}>
        <div className="premium-auth-orb premium-auth-orb--one" />
        <div className="premium-auth-orb premium-auth-orb--two" />
        <div className="premium-auth-story-content">
          <div className="premium-wordmark"><span>{brand.charAt(0)}</span>{brand}</div>
          <p className="premium-kicker">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="premium-auth-copy">{description}</p>
          <div className="premium-feature-list">
            {features.map(({ icon: Icon, title: itemTitle, copy }) => (
              <div className="premium-feature" key={itemTitle}>
                <span className="premium-feature-icon">{Icon ? <Icon size={19} /> : '✓'}</span>
                <span><strong>{itemTitle}</strong><small>{copy}</small></span>
              </div>
            ))}
          </div>
          <div className="premium-floating-card premium-floating-card--top"><span className="premium-live-dot" /> Thoughtful by design</div>
          <div className="premium-floating-card premium-floating-card--bottom">Fast · Secure · Effortless</div>
        </div>
      </section>
      <section className="premium-auth-form-zone">
        <div className="premium-auth-form-wrap">{children}</div>
      </section>
    </main>
  );
}

export function AuthProgress({ steps, current = 1 }) {
  return (
    <div className="auth-progress" aria-label={`Step ${current} of ${steps.length}`}>
      {steps.map((step, index) => (
        <div className={`auth-progress-step ${index + 1 <= current ? 'is-active' : ''}`} key={step}>
          <span>{index + 1}</span><small>{step}</small>
        </div>
      ))}
    </div>
  );
}

export function PageHero({ eyebrow, title, description, actions, children, compact = false }) {
  return (
    <header className={`premium-page-hero ${compact ? 'premium-page-hero--compact' : ''}`}>
      <div className="premium-page-hero-copy">
        {eyebrow && <p className="premium-kicker">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {actions && <div className="premium-hero-actions">{actions}</div>}
      </div>
      {children && <div className="premium-page-hero-visual">{children}</div>}
    </header>
  );
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="premium-section-header">
      <div>
        {eyebrow && <p className="premium-kicker">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function ContentShelf({ children, className = '' }) {
  return <div className={`premium-shelf ${className}`}>{children}</div>;
}

export function MetricCard({ icon: Icon, label, value, detail, tone }) {
  return (
    <article className="premium-metric-card">
      <div className="premium-metric-top">
        <span className="premium-metric-icon" style={tone ? { color: tone, background: `${tone}16` } : undefined}>{Icon && <Icon size={21} />}</span>
        {detail && <small>{detail}</small>}
      </div>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

export function ProfileHero({ initials, name, subtitle, badge, children }) {
  return (
    <section className="premium-profile-hero">
      <div className="premium-avatar">{initials}</div>
      <div className="premium-profile-copy"><p className="premium-kicker">Your account</p><h1>{name}</h1><p>{subtitle}</p>{badge && <span className="premium-profile-badge">{badge}</span>}</div>
      {children && <div className="premium-profile-actions">{children}</div>}
    </section>
  );
}

export function SettingsGroup({ title, description, children }) {
  return (
    <section className="premium-settings-group">
      <div className="premium-settings-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>
      <div className="premium-settings-list">{children}</div>
    </section>
  );
}

export function SettingsRow({ icon: Icon, title, subtitle, trailing, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className="premium-settings-row" onClick={onClick} type={onClick ? 'button' : undefined}>
      {Icon && <span className="premium-settings-icon"><Icon size={19} /></span>}
      <span className="premium-settings-copy"><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>
      {trailing && <span className="premium-settings-trailing">{trailing}</span>}
    </Tag>
  );
}
