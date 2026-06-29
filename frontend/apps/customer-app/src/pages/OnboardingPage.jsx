import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Bike,
    Clock3,
    Compass,
    Gift,
    MapPinned,
    ScanSearch,
    Sparkles,
    UtensilsCrossed,
} from 'lucide-react';

const slides = [
    {
        title: 'Order food from nearby restaurants',
        body: 'Browse standout local kitchens, discover trending dishes, and jump into a cleaner ordering flow built for quick cravings and slow dinner plans alike.',
        icon: UtensilsCrossed,
        accent: 'Neighborhood Picks',
        stageTitle: 'Discover flavors that feel local, fresh, and personal.',
        stageCopy: 'Your feed adapts to where you are, what you like, and what is hot right now so the first screen already feels useful.',
    },
    {
        title: 'Live track your delivery on map',
        body: 'Follow every step from restaurant acceptance to doorstep arrival with live movement, smarter ETA cues, and less guesswork during busy hours.',
        icon: MapPinned,
        accent: 'Live Motion',
        stageTitle: 'See every movement with calmer, clearer delivery tracking.',
        stageCopy: 'Track the handoff from kitchen to rider with map-first updates, cleaner timing signals, and a more futuristic delivery experience.',
    },
    {
        title: 'Fast delivery, great deals',
        body: 'Get reliable delivery, smarter pricing, and rewards that make repeat ordering feel effortless whether you are on mobile, tablet, or desktop.',
        icon: Bike,
        accent: 'Better Value',
        stageTitle: 'Move faster, save more, and keep every order feeling premium.',
        stageCopy: 'Speed, rewards, and polished ordering tools come together in a smoother system designed to feel light and modern on every screen.',
    },
];

const orbitIcons = [Compass, ScanSearch, Gift, Clock3];

export default function OnboardingPage({ onFinish }) {
    const [index, setIndex] = useState(0);
    const slide = useMemo(() => slides[index], [index]);
    const isLast = index === slides.length - 1;
    const Icon = slide.icon;

    return (
        <div className="onboarding-shell">
            <div className="onboarding-panel">
                <div className="onboarding-copy">
                    <div className="onboarding-header">
                        <div className="onboarding-eyebrow">
                            <Sparkles size={14} />
                            Pecafoo onboarding
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -18 }}
                                transition={{ duration: 0.32 }}
                                style={{ display: 'grid', gap: 22 }}
                            >
                                <div className="onboarding-icon-wrap">
                                    <Icon size={52} color="var(--accent)" />
                                </div>

                                <div>
                                    <p style={{
                                        color: 'var(--accent-strong)',
                                        fontWeight: 800,
                                        letterSpacing: '0.02em',
                                        marginBottom: 12,
                                    }}>
                                        {slide.accent}
                                    </p>
                                    <h1 className="onboarding-title">{slide.title}</h1>
                                </div>

                                <p className="onboarding-body">{slide.body}</p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="onboarding-actions">
                        <div className="onboarding-progress" aria-label="Onboarding progress">
                            {slides.map((_, slideIndex) => (
                                <span key={slideIndex} className={slideIndex === index ? 'active' : ''} />
                            ))}
                        </div>

                        <button
                            className="btn btn-primary btn-full onboarding-btn"
                            onClick={() => {
                                if (isLast) {
                                    onFinish();
                                    return;
                                }
                                setIndex((value) => value + 1);
                            }}
                        >
                            {isLast ? 'Get Started' : 'Continue'}
                            <ArrowRight size={20} />
                        </button>

                        {!isLast ? (
                            <button
                                className="btn btn-secondary btn-full onboarding-btn"
                                onClick={onFinish}
                            >
                                Skip for now
                            </button>
                        ) : null}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={`visual-${index}`}
                        className="onboarding-visual"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.34 }}
                    >
                        <div className="onboarding-stage">
                            <div className="onboarding-stage-top">
                                <span className="onboarding-stage-badge">{slide.accent}</span>
                                <span>0{index + 1} / 03</span>
                            </div>

                            <div className="onboarding-stage-card">
                                <h3>{slide.stageTitle}</h3>
                                <p>{slide.stageCopy}</p>
                            </div>

                            <div className="onboarding-orbit">
                                <div className="onboarding-orbit-center">
                                    <Icon size={36} />
                                </div>
                                {orbitIcons.map((OrbitIcon, orbitIndex) => (
                                    <div
                                        key={orbitIndex}
                                        className={`onboarding-orbit-point point-${orbitIndex + 1}`}
                                    >
                                        <OrbitIcon size={22} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
