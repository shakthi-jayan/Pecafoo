import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, ShieldCheck } from 'lucide-react';
import { GlassCard } from '../../shared-ui/PremiumUI';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      backgroundColor: 'var(--color-bg-base)'
    }}>
      {/* LEFT SIDE - Branding */}
      <section style={{
        position: 'relative',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--color-bg-base) 0%, var(--brand-customer) 150%)',
        overflow: 'hidden'
      }}>
        {/* Decorative Orbs */}
        <div style={{
          position: 'absolute',
          top: '-10%', left: '-10%',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'var(--brand-customer)',
          filter: 'blur(80px)',
          opacity: 0.15
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%', right: '-10%',
          width: '250px', height: '250px',
          borderRadius: '50%',
          background: 'var(--brand-customer)',
          filter: 'blur(60px)',
          opacity: 0.2
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '24px', color: 'var(--brand-customer)',
              boxShadow: 'var(--shadow-softer)'
            }}>P</div>
            <span style={{ fontSize: 'var(--text-h3)', fontWeight: 800, letterSpacing: '-0.03em' }}>Pecafoo</span>
          </div>

          <h1 style={{ fontSize: 'var(--text-display)', marginBottom: 'var(--space-4)' }}>
            {title || "Everything you crave, closer than ever."}
          </h1>
          <p style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            {subtitle || "Discover local favorites, follow every order live, and turn an everyday meal into something worth looking forward to."}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {[
              { icon: Sparkles, title: 'Curated for you', desc: 'Restaurants and dishes matched to your taste.' },
              { icon: MapPin, title: 'Live delivery', desc: 'Clear ETAs from the kitchen to your door.' },
              { icon: ShieldCheck, title: 'Order confidently', desc: 'Secure sign-in and dependable support.' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  backgroundColor: 'rgba(217, 70, 239, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--brand-customer)'
                }}>
                  <f.icon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{f.title}</div>
                  <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Glass Cards */}
          <GlassCard className="hidden-mobile" padding="var(--space-3) var(--space-4)" style={{ position: 'absolute', top: '10%', right: '-10%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              Live Order Tracking
            </div>
          </GlassCard>
        </div>
      </section>

      {/* RIGHT SIDE - Auth Form */}
      <section style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: 'var(--color-bg-card)',
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-soft)',
            border: '1px solid var(--color-border)'
          }}
        >
          {children}
        </motion.div>
      </section>
    </main>
  );
}
