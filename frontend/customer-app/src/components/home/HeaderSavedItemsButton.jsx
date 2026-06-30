import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeaderSavedItemsButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/saved-items')}
            aria-label="View saved items"
            title="Saved items"
            style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--brand-customer)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
            }}
        >
            <Heart size={20} />
        </button>
    );
}
