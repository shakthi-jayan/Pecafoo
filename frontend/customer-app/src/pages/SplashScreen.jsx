import { motion } from 'framer-motion';

export default function SplashScreen() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #ff7a45 0%, #ff5a1f 100%)',
            padding: 24,
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55, type: 'spring' }}
                style={{ textAlign: 'center', color: 'white' }}
            >
                <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        width: 96,
                        height: 96,
                        margin: '0 auto 20px',
                        borderRadius: 28,
                        background: 'rgba(255,255,255,0.18)',
                        boxShadow: '0 24px 54px rgba(0,0,0,0.16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 900,
                    }}
                >
                    P
                </motion.div>
                <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em' }}>
                    Pecafoo
                </div>
                <div style={{ marginTop: 8, opacity: 0.9, fontSize: '0.95rem' }}>
                    Food, delivered with live tracking
                </div>
            </motion.div>
        </div>
    );
}
