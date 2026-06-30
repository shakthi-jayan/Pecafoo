import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquareText, Package2, Star, User } from 'lucide-react';
import { format } from 'date-fns';
import { restaurantsAPI } from '../services/api';

const ReviewsPage = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data: result } = await restaurantsAPI.getReviews(slug);
                setData(result);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [slug]);

    const totalReviews = data?.total_reviews || 0;
    const avgRating = Number(data?.average_rating || 0);

    const renderStars = (count, size = 16) => (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((value) => (
                <Star
                    key={value}
                    size={size}
                    fill={value <= count ? '#fbbf24' : 'transparent'}
                    color={value <= count ? '#fbbf24' : 'rgba(165, 154, 184, 0.45)'}
                />
            ))}
        </div>
    );

    const getRatingColor = (rating) => {
        if (rating >= 4) return 'linear-gradient(135deg, #22c55e, #16a34a)';
        if (rating === 3) return 'linear-gradient(135deg, #f59e0b, #fb923c)';
        return 'linear-gradient(135deg, #ef476f, #f97316)';
    };

    if (loading) {
        return (
            <div className="page reviews-shell">
                <div className="reviews-header">
                    <div className="btn btn-icon skeleton" style={{ width: 48, height: 48 }} />
                    <div className="skeleton" style={{ height: 34, width: 220 }} />
                    <div style={{ width: 48 }} />
                </div>
                <div className="skeleton" style={{ height: 240, borderRadius: 34 }} />
                <div style={{ display: 'grid', gap: 14 }}>
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="skeleton" style={{ height: 150, borderRadius: 30 }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="page reviews-shell">
                <div className="reviews-header">
                    <button className="btn btn-icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="page-title">Reviews & Ratings</h1>
                    <div style={{ width: 48 }} />
                </div>

                <div className="card empty-state" style={{ minHeight: 320 }}>
                    <MessageSquareText size={44} style={{ opacity: 0.6 }} />
                    <h3>Reviews Unavailable</h3>
                    <p>We could not load reviews for this restaurant right now.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page reviews-shell">
            <div className="reviews-header">
                <button className="btn btn-icon" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="page-title" style={{ textAlign: 'center' }}>Reviews & Ratings</h1>
                <div style={{ width: 48 }} />
            </div>

            <motion.section
                className="reviews-hero"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="reviews-hero-grid">
                    <div className="reviews-score-panel">
                        <p style={{
                            color: 'var(--accent-strong)',
                            fontWeight: 800,
                            letterSpacing: '0.02em',
                            marginBottom: 10,
                        }}>
                            Guest sentiment
                        </p>
                        <h2>{avgRating.toFixed(1)}</h2>
                        <div style={{ marginTop: 12 }}>
                            {renderStars(Math.round(avgRating), 18)}
                        </div>
                        <p className="reviews-score-meta">
                            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} from verified orders
                        </p>
                    </div>

                    <div className="reviews-bars">
                        {[5, 4, 3, 2, 1].map((rating, barIndex) => {
                            const count = data.distribution?.[String(rating)] || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                            return (
                                <div key={rating} className="reviews-bar-row">
                                    <span style={{ fontWeight: 700 }}>{rating}</span>
                                    <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                    <div className="reviews-bar-track">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 0.55, delay: barIndex * 0.07 }}
                                            style={{
                                                height: '100%',
                                                borderRadius: 999,
                                                background: getRatingColor(rating),
                                            }}
                                        />
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.section>

            <div className="section-header" style={{ marginBottom: 4 }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>Customer Reviews</h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 700 }}>
                    Latest feedback
                </span>
            </div>

            {data.reviews?.length > 0 ? (
                <div className="reviews-list">
                    {data.reviews.map((review, index) => (
                        <motion.article
                            key={review.id || `${review.order_number}-${index}`}
                            className="card review-card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <div className="review-card-top">
                                <div className="review-user">
                                    <div className="review-avatar">
                                        <User size={18} />
                                    </div>
                                    <div className="review-user-meta">
                                        <p>{review.customer_name || 'Customer'}</p>
                                        <p>
                                            {review.date ? format(new Date(review.date), 'MMM dd, yyyy') : 'Recent review'}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="review-rating-pill"
                                    style={{ background: getRatingColor(review.rating) }}
                                >
                                    <Star size={13} fill="white" color="white" />
                                    {review.rating}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: 10 }}>
                                {renderStars(review.rating, 15)}
                                <p className="review-copy">
                                    {review.review || 'The customer left a rating without a written comment.'}
                                </p>
                            </div>

                            {review.order_number ? (
                                <div className="review-order-chip">
                                    <Package2 size={14} />
                                    Order #{review.order_number}
                                </div>
                            ) : null}
                        </motion.article>
                    ))}
                </div>
            ) : (
                <div className="card empty-state" style={{ minHeight: 280 }}>
                    <Star size={42} style={{ opacity: 0.5 }} />
                    <h3>No Reviews Yet</h3>
                    <p>Be the first guest to leave feedback for this restaurant.</p>
                </div>
            )}
        </div>
    );
};

export default ReviewsPage;
