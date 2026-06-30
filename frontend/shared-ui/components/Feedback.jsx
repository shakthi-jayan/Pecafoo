import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, onClose, title, children, actions, width = '460px' }) {
  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 'var(--space-4)'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: width,
              backgroundColor: 'var(--color-bg-card)',
              borderRadius: 'var(--radius-dialog)',
              boxShadow: 'var(--shadow-floating)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              maxHeight: '90vh'
            }}
          >
            {title && (
              <div style={{
                padding: 'var(--space-4) var(--space-5)',
                borderBottom: '1px solid var(--color-border)',
                fontWeight: 700,
                fontSize: 'var(--text-h3)',
                textAlign: 'center'
              }}>
                {title}
              </div>
            )}
            <div style={{ padding: 'var(--space-5)', overflowY: 'auto' }}>
              {children}
            </div>
            {actions && (
              <div style={{
                padding: 'var(--space-4) var(--space-5)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--space-3)',
                backgroundColor: 'var(--color-bg-base)'
              }}>
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function BottomSheet({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            style={{
              position: 'relative',
              width: '100%',
              backgroundColor: 'var(--color-bg-card)',
              borderTopLeftRadius: '32px',
              borderTopRightRadius: '32px',
              boxShadow: 'var(--shadow-floating)',
              padding: 'var(--space-5)',
              paddingBottom: 'calc(var(--space-5) + env(safe-area-inset-bottom))',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{
              width: '40px',
              height: '5px',
              backgroundColor: 'var(--color-border)',
              borderRadius: '5px',
              margin: '0 auto var(--space-4) auto'
            }} />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Badge({ children, variant = 'primary', brandColor = 'var(--brand-customer)', className='' }) {
  const variants = {
    primary: { bg: brandColor, color: '#FFF' },
    subtle: { bg: 'var(--color-divider)', color: 'var(--color-text-secondary)' },
    success: { bg: 'var(--color-success)', color: '#FFF' },
    warning: { bg: 'var(--color-warning)', color: '#111' },
    danger: { bg: 'var(--color-error)', color: '#FFF' },
  };
  
  const style = variants[variant] || variants.primary;

  return (
    <span className={`premium-badge ${className}`} style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      backgroundColor: style.bg,
      color: style.color
    }}>
      {children}
    </span>
  );
}

export function Chip({ label, icon: Icon, onClick, isActive, brandColor = 'var(--brand-customer)' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        border: isActive ? `1px solid ${brandColor}` : '1px solid var(--color-border)',
        backgroundColor: isActive ? brandColor : 'var(--color-bg-card)',
        color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
        fontSize: 'var(--text-caption)',
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--motion-duration-fast) ease',
        boxShadow: isActive ? `0 4px 12px ${brandColor}40` : 'none',
        outline: 'none'
      }}
    >
      {Icon && <Icon size={16} />}
      {label}
    </motion.button>
  );
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', className='' }) {
  return (
    <div className={`premium-skeleton ${className}`} style={{
      width, height, borderRadius,
      backgroundColor: 'var(--color-divider)',
      backgroundImage: 'linear-gradient(90deg, var(--color-divider) 0px, var(--color-border) 40px, var(--color-divider) 80px)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite linear'
    }}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-7) var(--space-4)',
      textAlign: 'center',
      width: '100%'
    }}>
      {Icon && (
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '40px',
          backgroundColor: 'var(--color-bg-card)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-tertiary)',
          marginBottom: 'var(--space-4)'
        }}>
          <Icon size={32} />
        </div>
      )}
      <h3 style={{ fontSize: 'var(--text-h3)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{title}</h3>
      {description && <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', marginBottom: 'var(--space-5)' }}>{description}</p>}
      {action}
    </div>
  );
}

// Simple placeholders
export const ErrorState = ({ title = "Something went wrong", description, onRetry }) => (
  <EmptyState title={title} description={description} action={onRetry && <button onClick={onRetry}>Retry</button>} />
);
export const Toast = () => null; // Implement via a toast context later if needed
export const Alert = ({ title, children, type = 'info' }) => (
  <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'var(--color-divider)' }}>
    {title && <strong>{title}</strong>}
    <div>{children}</div>
  </div>
);
export const LoadingOverlay = ({ isVisible }) => isVisible ? <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.8)', zIndex: 9999 }} /> : null;
