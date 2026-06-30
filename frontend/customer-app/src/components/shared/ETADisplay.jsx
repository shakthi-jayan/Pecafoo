import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ETADisplay = ({ estimatedMinutes }) => {
    const [timeLeft, setTimeLeft] = useState(estimatedMinutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = 100 - (timeLeft / (estimatedMinutes * 60) * 100);

    return (
        <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r="36" fill="none" stroke="var(--border)" strokeWidth="4" />
                <motion.circle
                    cx="40" cy="40" r="36" fill="none"
                    stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray="226" 
                    strokeDashoffset={226 - (226 * progress) / 100}
                    initial={{ strokeDashoffset: 226 }}
                    animate={{ strokeDashoffset: 226 - (226 * progress) / 100 }}
                    transition={{ ease: "linear", duration: 1 }}
                />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{minutes}</span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>min</span>
            </div>
        </div>
    );
};

export default ETADisplay;
