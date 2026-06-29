import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingInput = React.forwardRef(({
  label,
  icon: Icon,
  type = 'text',
  className = '',
  brandColor = 'var(--brand-customer)',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(props.value || props.defaultValue ? true : false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    if (props.onBlur) props.onBlur(e);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value.length > 0);
    if (props.onChange) props.onChange(e);
  };

  const active = isFocused || hasValue;

  return (
    <div className={`premium-floating-input ${className}`} style={{
      position: 'relative',
      width: '100%',
      backgroundColor: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-input)',
      border: `1px solid ${isFocused ? brandColor : 'var(--color-border)'}`,
      transition: 'border-color var(--motion-duration-fast) ease',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-4)',
      height: '56px'
    }}>
      {Icon && (
        <span style={{ 
          marginRight: 'var(--space-3)', 
          color: isFocused ? brandColor : 'var(--color-text-tertiary)',
          transition: 'color var(--motion-duration-fast) ease',
          display: 'flex'
        }}>
          <Icon size={20} />
        </span>
      )}
      <div style={{ position: 'relative', flex: 1, height: '100%' }}>
        <motion.label
          initial={false}
          animate={{
            y: active ? -12 : 0,
            scale: active ? 0.75 : 1,
            color: isFocused ? brandColor : 'var(--color-text-secondary)'
          }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'absolute',
            left: 0,
            top: '18px',
            pointerEvents: 'none',
            transformOrigin: 'left top'
          }}
        >
          {label}
        </motion.label>
        <input
          ref={ref}
          type={type}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            paddingTop: active ? '16px' : '0',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-primary)'
          }}
          {...props}
        />
      </div>
    </div>
  );
});

export const SearchBar = React.forwardRef(({
  placeholder = 'Search...',
  icon: Icon,
  className = '',
  brandColor = 'var(--brand-customer)',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`premium-search-bar ${className}`} style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'var(--color-bg-base)',
      borderRadius: 'var(--radius-full)',
      padding: '0 var(--space-4)',
      height: '48px',
      border: `1px solid ${isFocused ? brandColor : 'transparent'}`,
      transition: 'all var(--motion-duration-fast) ease',
      boxShadow: isFocused ? `0 0 0 3px ${brandColor}20` : 'none'
    }}>
      {Icon && (
        <span style={{ color: isFocused ? brandColor : 'var(--color-text-tertiary)', marginRight: 'var(--space-2)' }}>
          <Icon size={20} />
        </span>
      )}
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        onFocus={(e) => { setIsFocused(true); if(props.onFocus) props.onFocus(e); }}
        onBlur={(e) => { setIsFocused(false); if(props.onBlur) props.onBlur(e); }}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          width: '100%',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-primary)'
        }}
        {...props}
      />
    </div>
  );
});

// A simplified PasswordInput building on FloatingInput
export const PasswordInput = React.forwardRef(({ label, icon: Icon, brandColor, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <FloatingInput 
        ref={ref}
        label={label}
        icon={Icon}
        type={showPassword ? 'text' : 'password'}
        brandColor={brandColor}
        {...props}
      />
      <button 
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: 'absolute',
          right: 'var(--space-4)',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-caption)',
          fontWeight: 600
        }}
      >
        {showPassword ? 'HIDE' : 'SHOW'}
      </button>
    </div>
  );
});

// Simple placeholder implementations for Select, Dropdown, DatePicker, OTPInput
export const Select = React.forwardRef(({ label, options = [], className='', ...props }, ref) => {
  return (
    <div className={`premium-select ${className}`} style={{
      backgroundColor: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-input)',
      border: '1px solid var(--color-border)',
      height: '56px',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-4)'
    }}>
       <select ref={ref} style={{
         width: '100%',
         height: '100%',
         border: 'none',
         outline: 'none',
         background: 'transparent',
         fontSize: 'var(--text-body)',
         color: 'var(--color-text-primary)',
         appearance: 'none'
       }} {...props}>
         {label && <option value="" disabled selected>{label}</option>}
         {options.map((opt, i) => <option key={i} value={opt.value || opt}>{opt.label || opt}</option>)}
       </select>
       <span style={{ position: 'absolute', right: 'var(--space-4)', pointerEvents: 'none' }}>▼</span>
    </div>
  );
});

export const OTPInput = ({ length = 6, value, onChange, className='' }) => {
  // Simplified OTP layout for now
  return (
    <div className={`premium-otp-input ${className}`} style={{ display: 'flex', gap: 'var(--space-2)' }}>
       {Array.from({ length }).map((_, i) => (
         <input key={i} type="text" maxLength={1} style={{
           width: '48px',
           height: '56px',
           borderRadius: 'var(--radius-button)',
           border: '1px solid var(--color-border)',
           textAlign: 'center',
           fontSize: 'var(--text-h2)',
           fontWeight: 600,
           backgroundColor: 'var(--color-bg-card)'
         }} />
       ))}
    </div>
  );
};
