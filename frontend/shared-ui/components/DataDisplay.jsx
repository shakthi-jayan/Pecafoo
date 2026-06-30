import React from 'react';
import { motion } from 'framer-motion';

export function Avatar({ src, initials, size = 40, className = '' }) {
  return (
    <div className={`premium-avatar ${className}`} style={{
      width: size,
      height: size,
      borderRadius: 'var(--radius-avatar)',
      backgroundColor: 'var(--color-divider)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      color: 'var(--color-text-primary)',
      fontWeight: 700,
      fontSize: size * 0.4,
      flexShrink: 0
    }}>
      {src ? (
        <img src={src} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials
      )}
    </div>
  );
}

export function ProfileHeader({ name, subtitle, avatarSrc, avatarInitials }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: 'var(--space-5)',
      backgroundColor: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-md)'
    }}>
      <Avatar src={avatarSrc} initials={avatarInitials} size={72} />
      <div>
        <h2 style={{ fontSize: 'var(--text-h2)', fontWeight: 700, margin: '0 0 var(--space-1) 0', letterSpacing: '-0.03em' }}>{name}</h2>
        {subtitle && <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: 'var(--text-body)' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export function MetricCard({ label, value, detail, icon: Icon, brandColor = 'var(--brand-customer)', className = '' }) {
  return (
    <motion.div 
      className={`premium-metric-card ${className}`}
      whileHover={{ scale: 1.02 }}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        padding: 'var(--space-5)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '12px',
          backgroundColor: `${brandColor}15`,
          color: brandColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {Icon && <Icon size={20} />}
        </div>
        {detail && <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>{detail}</span>}
      </div>
      <div style={{ fontSize: 'var(--text-h2)', fontWeight: 700, marginBottom: 'var(--space-1)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
        {label}
      </div>
    </motion.div>
  );
}

// MapCard, RestaurantCard, FoodCard, OrderCard, StatCard are variations of cards.
export function RestaurantCard({ image, name, subtitle, rating, time, className = '' }) {
  return (
    <motion.div 
      className={`premium-restaurant-card ${className}`}
      whileHover={{ scale: 1.02, y: -4, boxShadow: 'var(--shadow-lg)' }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ width: '100%', height: '160px', backgroundColor: 'var(--color-divider)', position: 'relative' }}>
        {image && <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        {time && (
          <div style={{
            position: 'absolute',
            bottom: 'var(--space-3)',
            right: 'var(--space-3)',
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700
          }}>
            {time}
          </div>
        )}
      </div>
      <div style={{ padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{ fontSize: 'var(--text-h3)', margin: '0 0 var(--space-1) 0', fontWeight: 600 }}>{name}</h3>
          {rating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-caption)', fontWeight: 700 }}>
              <span style={{ color: '#FFCC00' }}>★</span> {rating}
            </div>
          )}
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)', margin: 0 }}>{subtitle}</p>
      </div>
    </motion.div>
  );
}

export function HorizontalScroller({ children, className = '' }) {
  return (
    <div className={`premium-horizontal-scroller ${className}`} style={{
      display: 'flex',
      gap: 'var(--space-4)',
      overflowX: 'auto',
      padding: 'var(--space-2) var(--space-4) var(--space-5) var(--space-4)',
      margin: '0 calc(var(--space-4) * -1)',
      scrollSnapType: 'x proximity',
      scrollbarWidth: 'none'
    }}>
      <style>{`.premium-horizontal-scroller::-webkit-scrollbar { display: none; }`}</style>
      {React.Children.map(children, child => (
        <div style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
          {child}
        </div>
      ))}
    </div>
  );
}

export function Table({ columns, data, className = '' }) {
  return (
    <div className={`premium-table-container ${className}`} style={{
      width: '100%',
      backgroundColor: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-softer)',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} style={{ 
                  padding: 'var(--space-4) var(--space-5)', 
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: i === data.length - 1 ? 'none' : '1px solid var(--color-divider)' }}>
                {columns.map((col, j) => (
                  <td key={j} style={{ 
                    padding: 'var(--space-4) var(--space-5)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Placeholders for DataGrid, Timeline, Stepper, ProgressRing, Carousel, FoodCard, OrderCard, MapCard, StatCard
export const DataGrid = Table;
export const Timeline = () => <div>Timeline Placeholder</div>;
export const Stepper = () => <div>Stepper Placeholder</div>;
export const ProgressRing = () => <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid var(--color-border)', borderTopColor: 'var(--brand-customer)' }} />;
export const Carousel = HorizontalScroller;
export function FoodCard({ name, description, image, price, discountPrice, isVeg, isBestseller, isAvailable = true, quantity = 0, onAdd, onIncrement, onDecrement, onWishlist, isWishlisted, className = '' }) {
  return (
    <motion.div 
      className={`premium-food-card ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-card)',
        boxShadow: 'var(--shadow-softer)',
        border: '1px solid var(--color-border)',
        display: 'flex', gap: 'var(--space-4)',
        alignItems: 'stretch'
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          width: 14, height: 14, borderRadius: 3, 
          border: `2px solid ${isVeg ? '#22c55e' : '#ef476f'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-1)'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: isVeg ? '#22c55e' : '#ef476f' }} />
        </div>
        
        <h4 style={{ fontSize: 'var(--text-body)', margin: '0 0 var(--space-1) 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {name}
          {isBestseller && <span style={{ backgroundColor: 'rgba(217, 70, 239, 0.1)', color: 'var(--brand-customer)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Best</span>}
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
          <strong style={{ fontSize: 'var(--text-body)', fontWeight: 800 }}>₹{discountPrice || price}</strong>
          {discountPrice && discountPrice < price && (
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-tertiary)', textDecoration: 'line-through' }}>₹{price}</span>
          )}
        </div>
        
        {description && <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-3) 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</p>}
        
        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={onWishlist}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '4px', 
              color: isWishlisted ? '#f43f5e' : 'var(--color-text-tertiary)', 
              fontSize: '11px', fontWeight: 700, background: 'none', border: 'none', padding: 0, cursor: 'pointer' 
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={isWishlisted ? '#f43f5e' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {isWishlisted ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      
      <div style={{ width: '100px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--color-divider)' }}>
          {image ? (
             <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          ) : (
             <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>
             </div>
          )}
        </div>
        
        {!isAvailable ? (
          <div style={{ backgroundColor: 'var(--color-danger)', color: 'white', fontSize: '10px', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Sold Out</div>
        ) : quantity === 0 ? (
          <button 
            onClick={onAdd}
            style={{ 
              width: '100%', padding: '6px 0', backgroundColor: 'var(--color-bg-base)', 
              color: 'var(--brand-customer)', border: '1px solid var(--brand-customer)', borderRadius: '8px', 
              fontSize: '12px', fontWeight: 800, cursor: 'pointer', boxShadow: 'var(--shadow-softer)' 
            }}
          >
            ADD
          </button>
        ) : (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', 
            backgroundColor: 'var(--brand-customer)', color: 'white', borderRadius: '8px', overflow: 'hidden' 
          }}>
            <button onClick={onDecrement} style={{ background: 'none', border: 'none', color: 'white', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>{quantity}</span>
            <button onClick={onIncrement} style={{ background: 'none', border: 'none', color: 'white', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
export const OrderCard = RestaurantCard;
export const MapCard = RestaurantCard;
export const StatCard = MetricCard;
