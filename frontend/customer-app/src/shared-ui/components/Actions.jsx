import React from 'react';
import { motion } from 'framer-motion';

export const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  brandColor = 'var(--brand-customer)',
  className = '',
  style = {},
  ...props 
}, ref) => {
  
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    borderRadius: 'var(--radius-button)',
    fontWeight: 600,
    fontSize: 'var(--text-body)',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    transition: 'background-color var(--motion-duration-fast) ease, color var(--motion-duration-fast) ease, border-color var(--motion-duration-fast) ease',
    width: fullWidth ? '100%' : 'auto'
  };

  const sizes = {
    small: { height: '36px', padding: '0 var(--space-3)', fontSize: 'var(--text-caption)' },
    medium: { height: '48px', padding: '0 var(--space-4)' },
    large: { height: '56px', padding: '0 var(--space-5)', fontSize: 'var(--text-h3)' }
  };

  const variants = {
    primary: {
      backgroundColor: brandColor,
      color: '#FFFFFF',
      boxShadow: `0 4px 12px ${brandColor}30`,
    },
    secondary: {
      backgroundColor: 'var(--color-bg-base)',
      color: 'var(--color-text-primary)',
      border: 'none',
      boxShadow: 'none',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: brandColor,
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: '#FFFFFF',
      boxShadow: `0 4px 12px rgba(255, 59, 48, 0.2)`,
    }
  };

  const combinedStyle = { ...baseStyle, ...sizes[size], ...variants[variant], ...style };

  return (
    <motion.button
      ref={ref}
      className={`premium-btn premium-btn-${variant} ${className}`}
      style={combinedStyle}
      whileHover={{ scale: variant === 'ghost' ? 1.05 : 1.01 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={size === 'small' ? 16 : 20} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={size === 'small' ? 16 : 20} />}
    </motion.button>
  );
});

export const IconButton = React.forwardRef(({ 
  icon: Icon,
  variant = 'secondary', 
  size = 'medium',
  brandColor = 'var(--brand-customer)',
  className = '',
  style = {},
  ...props 
}, ref) => {
  const sizes = {
    small: { width: '32px', height: '32px' },
    medium: { width: '48px', height: '48px' },
    large: { width: '56px', height: '56px' }
  };
  
  return (
    <Button 
      ref={ref}
      variant={variant} 
      size={size} 
      brandColor={brandColor}
      className={`premium-icon-btn ${className}`}
      style={{
        padding: 0,
        borderRadius: 'var(--radius-button)',
        ...sizes[size],
        ...style
      }}
      {...props}
    >
      <Icon size={size === 'small' ? 16 : 24} />
    </Button>
  );
});

export const Checkbox = React.forwardRef(({ 
  checked, 
  onChange, 
  label,
  brandColor = 'var(--brand-customer)',
  className = '',
  ...props 
}, ref) => {
  return (
    <label className={`premium-checkbox-wrapper ${className}`} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      cursor: 'pointer'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '8px',
        border: checked ? `2px solid ${brandColor}` : '2px solid var(--color-border)',
        backgroundColor: checked ? brandColor : 'var(--color-bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--motion-duration-fast) ease'
      }}>
        {checked && (
          <motion.svg 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            width="14" height="10" viewBox="0 0 14 10" fill="none"
          >
            <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        )}
      </div>
      <input 
        type="checkbox" 
        ref={ref}
        checked={checked} 
        onChange={onChange}
        style={{ display: 'none' }}
        {...props}
      />
      {label && <span style={{ fontSize: 'var(--text-body)' }}>{label}</span>}
    </label>
  );
});

export const Switch = React.forwardRef(({ 
  checked, 
  onChange,
  brandColor = 'var(--brand-success)',
  className = '',
  ...props 
}, ref) => {
  return (
    <div 
      className={`premium-switch ${className}`}
      onClick={() => onChange(!checked)}
      style={{
        width: '50px',
        height: '30px',
        borderRadius: '15px',
        backgroundColor: checked ? brandColor : 'var(--color-border)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color var(--motion-duration-fast) ease'
      }}
    >
      <motion.div
        initial={false}
        animate={{
          x: checked ? 22 : 2
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          position: 'absolute',
          top: '2px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      />
      <input 
        type="checkbox" 
        ref={ref}
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
        {...props}
      />
    </div>
  );
});

export const Radio = React.forwardRef(({ 
  checked, 
  onChange, 
  label,
  brandColor = 'var(--brand-customer)',
  className = '',
  ...props 
}, ref) => {
  return (
    <label className={`premium-radio-wrapper ${className}`} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      cursor: 'pointer'
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: checked ? `2px solid ${brandColor}` : '2px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all var(--motion-duration-fast) ease'
      }}>
        {checked && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: brandColor
            }}
          />
        )}
      </div>
      <input 
        type="radio" 
        ref={ref}
        checked={checked} 
        onChange={onChange}
        style={{ display: 'none' }}
        {...props}
      />
      {label && <span style={{ fontSize: 'var(--text-body)' }}>{label}</span>}
    </label>
  );
});
