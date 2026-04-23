import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const skeletons = Array(count).fill(0);

    const getStyle = () => {
        switch (type) {
            case 'card':
                return { height: 200, borderRadius: 16, marginBottom: 16 };
            case 'text':
                return { height: 16, borderRadius: 4, marginBottom: 8 };
            case 'avatar':
                return { width: 48, height: 48, borderRadius: '50%' };
            case 'list-item':
                return { height: 60, borderRadius: 12, marginBottom: 8 };
            default:
                return { height: 100, borderRadius: 8 };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: type === 'list-item' ? 0 : 12, width: '100%' }}>
            {skeletons.map((_, i) => (
                <motion.div
                    key={i}
                    className="skeleton"
                    style={getStyle()}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                />
            ))}
        </div>
    );
};

export default SkeletonLoader;
