import { motion } from 'framer-motion';
import { Check, Clock, ChefHat, Bike, Home, Package } from 'lucide-react';

const stages = [
    { id: 'placed', label: 'Placed', icon: Clock },
    { id: 'confirmed', label: 'Confirmed', icon: Check },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'ready', label: 'Ready', icon: Package },
    { id: 'picked_up', label: 'On the Way', icon: Bike },
    { id: 'delivered', label: 'Delivered', icon: Home }
];


const statusMap = { on_the_way: 'picked_up' };

const LiveOrderTracker = ({ currentStatus }) => {
    const mapped = statusMap[currentStatus] || currentStatus;
    const currentIndex = stages.findIndex(s => s.id === mapped);
    const activeIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
        <div style={{ width: '100%', padding: '12px 0 4px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    position: 'relative',
                    gap: 10,
                    minWidth: stages.length * 72,
                    marginBottom: 12,
                    paddingInline: 4,
                }}
            >
                {}
                <div style={{
                    position: 'absolute', top: 16, left: 22, right: 22, height: 4,
                    background: 'var(--border)', zIndex: 0, borderRadius: 2
                }} />

                {}
                <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                        position: 'absolute', top: 16, left: 22, height: 4,
                        background: 'var(--accent)', zIndex: 1, borderRadius: 2
                    }}
                />

                {stages.map((stage, i) => {
                    const Icon = stage.icon;
                    const isActive = i <= activeIndex;
                    const isCurrent = i === activeIndex;

                    return (
                        <div
                            key={stage.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                zIndex: 2,
                                flex: 1,
                                minWidth: 62,
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: isCurrent ? 1.2 : 1, backgroundColor: isActive ? 'var(--accent)' : 'var(--bg-elevated)' }}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                                    color: isActive ? 'white' : 'var(--text-muted)'
                                }}
                            >
                                <Icon size={16} />
                            </motion.div>
                            <p style={{
                                fontSize: '0.72rem', marginTop: 8, fontWeight: isActive ? 700 : 500,
                                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                                textAlign: 'center',
                                lineHeight: 1.2,
                                maxWidth: 68,
                            }}>
                                {stage.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LiveOrderTracker;
