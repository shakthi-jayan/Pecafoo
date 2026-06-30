import os
import re

def process_delivery():
    path = r"c:\Users\Machodev\Documents\Pecafoo\frontend\delivery-app\src\pages\RegisterPage.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.search(r'(.*?)(return\s*\()', content, re.DOTALL)
    if not match:
        print("Could not find return in delivery")
        return
    
    pre_return = match.group(1)
    
    new_return = """return (
        <div className="premium-register-layout">
            <style>{`
                .premium-register-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }
                .premium-register-left {
                    flex: 0 0 40%;
                    background: #ffffff;
                    padding: 4vw;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-right: 1px solid #f1f5f9;
                    position: relative;
                    overflow: hidden;
                }
                .premium-register-left::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at top left, rgba(34, 197, 94, 0.05), transparent 60%);
                    pointer-events: none;
                }
                .premium-register-right {
                    flex: 1;
                    padding: 4vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fafaf9;
                }
                .premium-register-card {
                    width: 100%;
                    max-width: 680px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 48px;
                    border-radius: 24px;
                    box-shadow: 0 24px 48px -12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02);
                }
                .premium-btn {
                    width: 100%;
                    height: 56px;
                    border-radius: 16px;
                    border: none;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    background: linear-gradient(135deg, #22C55E 0%, #16a34a 100%);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-top: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .premium-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(34, 197, 94, 0.25);
                }
                .premium-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .premium-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .benefit-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .benefit-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: rgba(34, 197, 94, 0.1);
                    color: #22C55E;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .form-section-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 32px 0 16px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .form-section-title::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e2e8f0;
                }
                @media (max-width: 992px) {
                    .premium-register-layout { flex-direction: column; }
                    .premium-register-left { flex: none; padding: 48px 24px; border-right: none; }
                    .premium-register-right { padding: 24px; background: #ffffff; }
                    .premium-register-card { padding: 0; box-shadow: none; border-radius: 0; background: transparent; }
                }
            `}</style>
            
            <div className="premium-register-left">
                <div style={{ maxWidth: 420, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 48, height: 48, background: '#0f172a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 32 }}>
                        <Navigation size={24} />
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, color: '#0f172a' }}>
                        Earn on your own schedule.
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.6, marginBottom: 48 }}>
                        Set up your partner profile once and start earning when it works for you.
                    </p>
                    
                    <div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><Navigation size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Choose your momentum</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Go online and accept deliveries whenever you are ready.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><WalletCards size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Transparent earnings</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Clear daily and weekly totals delivered right to your dashboard.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Simple verification</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Your documents stay secure, grouped, and visible.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="premium-register-right">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="premium-register-card">
                    
                    {/* Apple-style Stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
                        {['Account', 'Vehicle', 'Verify'].map((step, i) => {
                            const current = 1;
                            const isActive = i + 1 === current;
                            const isDone = i + 1 < current;
                            return (
                                <React.Fragment key={step}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isActive || isDone ? '#22C55E' : '#f1f5f9',
                                            color: isActive || isDone ? 'white' : '#94a3b8',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {isDone ? <CheckCircle size={14} /> : (isActive ? <div style={{width: 8, height: 8, borderRadius: 4, background: 'white'}}/> : <div style={{width: 6, height: 6, borderRadius: 3, background: '#cbd5e1'}}/>)}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#0f172a' : '#94a3b8' }}>{step}</span>
                                    </div>
                                    {i < 2 && (
                                        <div style={{ width: 40, height: 2, background: isDone ? '#22C55E' : '#f1f5f9', marginTop: -24 }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>Become a Delivery Partner</h2>
                        <p style={{ color: '#64748b', fontSize: '16px' }}>Create your account and upload verification documents.</p>
                    </div>

                    {accountExists ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px', background: '#f0fdf4', borderRadius: 20, border: '1px solid #dcfce7' }}>
                            <div style={{ marginBottom: 16 }}>
                                <User size={48} color="#22C55E" style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8, color: '#166534' }}>Account Already Exists</h3>
                            <p style={{ fontSize: '15px', color: '#166534', marginBottom: 24, lineHeight: 1.5, opacity: 0.9 }}>
                                We found an existing Pecafoo account associated with this email. You can use your existing account to become a Delivery Partner.
                            </p>
                            <Link 
                                to={`/login?email=${encodeURIComponent(fd.email)}`}
                                className="premium-btn"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            >
                                Log In to Add Delivery Role
                            </Link>
                        </motion.div>
                    ) : (
                    <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        <div className="form-section-title">Name</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput id="first_name" name="first_name" label="First Name" value={fd.first_name} onChange={ch} required brandColor="var(--brand-delivery)" />
                            <FloatingInput id="last_name" name="last_name" label="Last Name" value={fd.last_name} onChange={ch} required brandColor="var(--brand-delivery)" />
                        </div>
                        
                        <div className="form-section-title">Contact</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput id="email" type="email" name="email" label="Email Address" value={fd.email} onChange={ch} required autoComplete="email" brandColor="var(--brand-delivery)" />
                            <FloatingInput id="phone_number" type="tel" name="phone_number" label="Mobile Number" value={fd.phone_number} onChange={handlePhoneChange} required brandColor="var(--brand-delivery)" />
                        </div>
                        
                        <div className="form-section-title">Vehicle</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <select name="vehicle_type" value={fd.vehicle_type} onChange={ch} style={{ height: '56px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '0 16px', fontSize: '16px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s', width: '100%' }}>
                                    <option value="bicycle">Bicycle</option>
                                    <option value="motorcycle">Motorcycle</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                            <FloatingInput id="vehicle_number" name="vehicle_number" label="Vehicle Number" value={fd.vehicle_number} onChange={ch} brandColor="var(--brand-delivery)" />
                        </div>
                        <FloatingInput id="license_number" name="license_number" label="License Number" value={fd.license_number} onChange={ch} brandColor="var(--brand-delivery)" />
                        
                        <div className="form-section-title">Passwords</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <PasswordInput id="password" name="password" label="Password (min 8 chars)" value={fd.password} onChange={ch} required minLength={8} autoComplete="new-password" brandColor="var(--brand-delivery)" />
                            <PasswordInput id="password_confirm" name="password_confirm" label="Confirm Password" value={fd.password_confirm} onChange={ch} required minLength={8} autoComplete="new-password" brandColor="var(--brand-delivery)" />
                        </div>

                        {/* High-Fidelity Documents Section */}
                        <div className="form-section-title">Verification Uploads</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: 'ID Proof', name: 'id_proof' },
                                { label: 'Driving License / Vehicle Permit', name: 'license_image' }
                            ].map(field => {
                                const file = docs[field.name];
                                return (
                                    <label key={field.name} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px',
                                        background: file ? '#f0fdf4' : '#ffffff',
                                        border: file ? '2px solid #22C55E' : '1px dashed #cbd5e1',
                                        borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s ease',
                                        boxShadow: file ? '0 4px 12px rgba(34,197,94,0.1)' : 'none'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 12, background: file ? '#22C55E' : '#f1f5f9', color: file ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                                                {file ? <FileText size={24} /> : <Upload size={24} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                                                    {field.label}
                                                </div>
                                                <div style={{ fontSize: 13, color: file ? '#22C55E' : '#94a3b8', fontWeight: file ? 600 : 400 }}>
                                                    {file ? file.name : 'Drag & Drop or Choose File'}
                                                </div>
                                            </div>
                                        </div>
                                        {!file && (
                                            <div style={{ padding: '8px 16px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                                Browse
                                            </div>
                                        )}
                                        {file && (
                                            <div style={{ padding: '6px', borderRadius: '50%', background: '#22C55E', color: 'white' }}>
                                                <CheckCircle size={16} />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            name={field.name}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const f = e.target.files?.[0] || null;
                                                setDocs(prev => ({ ...prev, [field.name]: f }));
                                            }}
                                        />
                                    </label>
                                );
                            })}
                        </div>

                        <button type="submit" className="premium-btn" disabled={loading}>
                            {loading ? <><Loader2 className="spin" size={20} /> Creating Account...</> : <>Create Account <ArrowRight size={20} /></>}
                        </button>
                    </form>
                    )}
                    
                    <p style={{ textAlign: 'center', marginTop: 32, color: '#64748b', fontSize: '15px' }}>
                        Already have an account? <Link to="/login" style={{ color: '#22C55E', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
"""

    with open(path, "w", encoding="utf-8") as f:
        f.write(pre_return + new_return)

process_delivery()
print("Delivery generated")
