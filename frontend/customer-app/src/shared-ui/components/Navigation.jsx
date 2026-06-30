import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom'; // Assuming react-router is used

export function SegmentedControl({ options, value, onChange, brandColor = 'var(--brand-customer)', className='' }) {
  return (
    <div className={`premium-segmented-control ${className}`} style={{
      display: 'inline-flex',
      backgroundColor: 'var(--color-divider)',
      borderRadius: 'var(--radius-button)',
      padding: '4px',
      position: 'relative'
    }}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <div
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              position: 'relative',
              padding: '8px 24px',
              cursor: 'pointer',
              zIndex: 1,
              fontWeight: isSelected ? 600 : 500,
              fontSize: 'var(--text-caption)',
              color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              transition: 'color var(--motion-duration-fast) ease'
            }}
          >
            {isSelected && (
              <motion.div
                layoutId="segmented-control-bg"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'var(--color-bg-card)',
                  borderRadius: 'calc(var(--radius-button) - 4px)',
                  boxShadow: 'var(--shadow-softer)',
                  zIndex: -1
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {opt.label}
          </div>
        );
      })}
    </div>
  );
}

export function Tabs({ tabs, activeTab, onChange, brandColor = 'var(--brand-customer)', className='' }) {
  return (
    <div className={`premium-tabs ${className}`} style={{ display: 'flex', gap: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              position: 'relative',
              padding: 'var(--space-3) 0',
              cursor: 'pointer',
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? brandColor : 'var(--color-text-secondary)',
              fontSize: 'var(--text-body)',
              transition: 'color var(--motion-duration-fast) ease'
            }}
          >
            {tab.label}
            {isSelected && (
              <motion.div
                layoutId="active-tab-indicator"
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: brandColor,
                  borderRadius: '2px 2px 0 0'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BottomNavigation({ items, activeItem, onChange, brandColor = 'var(--brand-customer)' }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--space-4)',
      left: 'var(--space-4)',
      right: 'var(--space-4)',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-dialog)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: 'var(--space-2) var(--space-2)',
      paddingBottom: 'calc(var(--space-2) + env(safe-area-inset-bottom))',
      zIndex: 100,
      boxShadow: 'var(--shadow-floating)'
    }}>
      {items.map((item) => {
        const isSelected = activeItem === item.id;
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            onClick={() => onChange(item.id)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              color: isSelected ? brandColor : 'var(--color-text-tertiary)',
              transition: 'color var(--motion-duration-fast) ease',
              marginTop: 'var(--space-2)',
              marginBottom: 'var(--space-2)'
            }}
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <Icon size={24} weight={isSelected ? 'fill' : 'regular'} />
            </motion.div>
            <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: isSelected ? 600 : 500 }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Sidebar({ children, isOpen, onClose, brandColor = 'var(--brand-customer)' }) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 900
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            style={{
              position: 'fixed',
              top: 'var(--space-4)',
              left: 'var(--space-4)',
              bottom: 'var(--space-4)',
              width: '280px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 'var(--radius-dialog)',
              boxShadow: 'var(--shadow-floating)',
              zIndex: 901,
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Simple placeholders for Drawer, NavigationBar
export const Drawer = Sidebar; // For this phase, drawer and sidebar can share the exact same behavior

export function NavigationBar({ title, leftAction, rightAction, brandColor = 'var(--brand-customer)' }) {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-3) var(--space-4)',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--color-border)'
    }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>{leftAction}</div>
      <div style={{ flex: 2, textAlign: 'center', fontWeight: 600, fontSize: 'var(--text-body)', letterSpacing: '-0.02em' }}>
        {title}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>{rightAction}</div>
    </div>
  );
}
