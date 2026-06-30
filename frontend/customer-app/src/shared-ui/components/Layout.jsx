import React from 'react';
import { motion } from 'framer-motion';
import '../premium-ui.css';

export function PageContainer({ children, className = '', maxWidth = '1200px', padding = 'var(--space-4)' }) {
  return (
    <div 
      className={`page-container ${className}`} 
      style={{
        maxWidth,
        margin: '0 auto',
        padding,
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}
    >
      {children}
    </div>
  );
}

export function ResponsiveGrid({ children, className = '', columns = 'repeat(auto-fit, minmax(280px, 1fr))', gap = 'var(--space-5)' }) {
  return (
    <div 
      className={`responsive-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: columns,
        gap,
        width: '100%'
      }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, description, action, className = '' }) {
  return (
    <div className={`section-header ${className}`} style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-5)',
      marginBottom: 'var(--space-5)'
    }}>
      <div style={{ flex: 1 }}>
        {eyebrow && (
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-caption)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 'var(--space-2)'
          }}>
            {eyebrow}
          </p>
        )}
        <h2 style={{
          fontSize: 'var(--text-h2)',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          color: 'var(--color-text-primary)',
          margin: 0
        }}>
          {title}
        </h2>
        {description && (
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-body)',
            marginTop: 'var(--space-2)'
          }}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function HeroBanner({ eyebrow, title, description, actions, children, align = 'left', className = '' }) {
  return (
    <div className={`hero-banner ${className}`} style={{
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: children ? '1fr 1fr' : '1fr',
      gap: 'var(--space-6)',
      alignItems: 'center',
      padding: 'var(--space-7) var(--space-6)',
      marginBottom: 'var(--space-6)',
      overflow: 'hidden',
      borderRadius: 'var(--radius-card)',
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-lg)',
      textAlign: align
    }}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start' }}>
        {eyebrow && (
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-caption)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 'var(--space-3)'
          }}>
            {eyebrow}
          </p>
        )}
        <h1 style={{
          fontSize: 'var(--text-hero)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          color: 'var(--color-text-primary)',
          margin: '0 0 var(--space-3) 0',
          lineHeight: 'var(--line-height-tight)'
        }}>
          {title}
        </h1>
        {description && (
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-body)',
            lineHeight: 'var(--line-height-relaxed)',
            maxWidth: '600px',
            margin: '0 0 var(--space-4) 0'
          }}>
            {description}
          </p>
        )}
        {actions && (
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
            {actions}
          </div>
        )}
      </div>
      {children && (
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function GlassCard({ children, className = '', padding = 'var(--space-5)' }) {
  return (
    <div className={`glass-card ${className}`} style={{
      padding,
      borderRadius: 'var(--radius-card)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: 'var(--shadow-soft)'
    }}>
      {children}
    </div>
  );
}
