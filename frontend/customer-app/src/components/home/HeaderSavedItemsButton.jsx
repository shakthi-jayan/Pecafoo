import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HeaderSavedItemsButton() {
    const navigate = useNavigate();

    return (
        <button
            className="btn-icon"
            onClick={() => navigate('/saved-items')}
            aria-label="View saved items"
            title="Saved items"
            style={{ color: 'var(--accent-strong)' }}
        >
            <Heart size={20} />
        </button>
    );
}
