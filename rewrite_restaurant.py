import os
import re

def process_restaurant():
    path = r"c:\Users\Machodev\Documents\Pecafoo\frontend\restaurant-app\src\pages\RegisterPage.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract everything before `return (`
    match = re.search(r'(.*?)(return\s*\()', content, re.DOTALL)
    if not match:
        print("Could not find return in restaurant")
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
                    background: radial-gradient(circle at top left, rgba(249, 115, 22, 0.05), transparent 60%);
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
                    background: linear-gradient(135deg, #F97316 0%, #ea580c 100%);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-top: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .premium-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(249, 115, 22, 0.25);
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
                    background: rgba(249, 115, 22, 0.1);
                    color: #F97316;
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
                        <ChefHat size={24} />
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, color: '#0f172a' }}>
                        Grow your restaurant with Pecafoo.
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.6, marginBottom: 48 }}>
                        Join thousands of restaurants reaching more customers and boosting revenue every day.
                    </p>
                    
                    <div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><BarChart3 size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>More Orders</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Thousands of nearby customers waiting for your food.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Fast Verification</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Quick onboarding to get you selling immediately.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ChefHat size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Real-time Dashboard</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Track everything from orders to earnings in one place.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="premium-register-right">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="premium-register-card">
                    
                    {/* Apple-style Stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
                        {['Account', 'Business', 'Verification'].map((step, i) => {
                            const current = 1;
                            const isActive = i + 1 === current;
                            const isDone = i + 1 < current;
                            return (
                                <React.Fragment key={step}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isActive || isDone ? '#F97316' : '#f1f5f9',
                                            color: isActive || isDone ? 'white' : '#94a3b8',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {isDone ? <CheckCircle size={14} /> : (isActive ? <div style={{width: 8, height: 8, borderRadius: 4, background: 'white'}}/> : <div style={{width: 6, height: 6, borderRadius: 3, background: '#cbd5e1'}}/>)}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#0f172a' : '#94a3b8' }}>{step}</span>
                                    </div>
                                    {i < 2 && (
                                        <div style={{ width: 40, height: 2, background: isDone ? '#F97316' : '#f1f5f9', marginTop: -24 }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>Create your Restaurant Account</h2>
                        <p style={{ color: '#64748b', fontSize: '16px' }}>Let's get your business set up for success.</p>
                    </div>

                    {accountExists ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px', background: '#fff7ed', borderRadius: 20, border: '1px solid #ffedd5' }}>
                            <div style={{ marginBottom: 16 }}>
                                <AlertCircle size={48} color="#F97316" style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8, color: '#9a3412' }}>Account Already Exists</h3>
                            <p style={{ fontSize: '15px', color: '#9a3412', marginBottom: 24, lineHeight: 1.5, opacity: 0.9 }}>
                                We found an existing Pecafoo account associated with this email. You can use your existing account to become a Restaurant Partner.
                            </p>
                            <Link 
                                to={`/login?email=${encodeURIComponent(formData.email)}`}
                                className="premium-btn"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            >
                                Log In to Add Restaurant Role
                            </Link>
                        </motion.div>
                    ) : (
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        <div className="form-section-title">Name</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput name="first_name" label="First Name" value={formData.first_name} onChange={handleChange} required />
                            <FloatingInput name="last_name" label="Last Name" value={formData.last_name} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-section-title">Contact</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput type="email" name="email" label="Email Address" value={formData.email} onChange={handleChange} required autoComplete="email" />
                            <FloatingInput type="tel" name="phone_number" label="Mobile Number" value={formData.phone_number} onChange={handlePhoneChange} required />
                        </div>
                        
                        <div className="form-section-title">Business</div>
                        <FloatingInput name="restaurant_name" label="Restaurant Name" value={formData.restaurant_name} onChange={handleChange} required />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                            <FloatingInput name="cuisine_type" label="Cuisine Type (e.g., Indian, Chinese)" value={formData.cuisine_type} onChange={handleChange} />
                            <FloatingInput type="tel" name="restaurant_phone" label="Restaurant Phone" value={formData.restaurant_phone} onChange={handleChange} />
                        </div>
                        
                        <FloatingInput name="description" label="Short Description" value={formData.description} onChange={handleChange} />
                        
                        <div className="form-section-title">Location</div>
                        <FloatingInput name="address" label="Street Address" value={formData.address} onChange={handleChange} required />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            <FloatingInput name="city" label="City" value={formData.city} onChange={handleChange} required />
                            <FloatingInput name="state" label="State" value={formData.state} onChange={handleChange} required />
                            <FloatingInput name="pincode" label="Pincode" value={formData.pincode} onChange={handleChange} required />
                        </div>
                        
                        {/* High-Fidelity Location Widget */}
                        <div style={{ background: formData.latitude ? '#f0fdf4' : (permissionBlocked ? '#fffbeb' : '#f8fafc'), padding: '20px', borderRadius: 16, border: formData.latitude ? '1px solid #86efac' : (permissionBlocked ? '1px solid #fde047' : '1px solid #e2e8f0'), transition: 'all 0.3s ease' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <MapPin size={18} color={formData.latitude ? '#16a34a' : (permissionBlocked ? '#d97706' : '#F97316')} />
                                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>Restaurant GPS Location</span>
                                        {!formData.latitude && (
                                            <span style={{ fontSize: '11px', background: permissionBlocked ? '#fef3c7' : '#fee2e2', color: permissionBlocked ? '#92400e' : '#ef4444', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{permissionBlocked ? 'Blocked' : 'Required'}</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '13px', color: formData.latitude ? '#16a34a' : (permissionBlocked ? '#b45309' : '#64748b') }}>
                                        {formData.latitude ? `Verified Location: ${Number(formData.latitude).toFixed(4)}, ${Number(formData.longitude).toFixed(4)}` : (permissionBlocked ? 'Location access is blocked in your browser.' : 'Required for accurate delivery routing')}
                                    </div>
                                </div>
                                <button type="button" onClick={fetchLocation} disabled={fetchingLocation} style={{
                                    padding: '10px 20px', fontSize: '14px', background: formData.latitude ? '#ffffff' : (permissionBlocked ? '#fef3c7' : '#F97316'),
                                    color: formData.latitude ? '#16a34a' : (permissionBlocked ? '#92400e' : 'white'),
                                    border: formData.latitude ? '1px solid #bbf7d0' : (permissionBlocked ? '1px solid #f59e0b' : 'none'),
                                    borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer', boxShadow: formData.latitude || permissionBlocked ? 'none' : '0 4px 12px rgba(249, 115, 22, 0.2)'
                                }}>
                                    {fetchingLocation ? <><Loader2 size={16} className="spin" /> Fetching...</> : <><MapPin size={16} /> {formData.latitude ? 'Update Location' : (permissionBlocked ? 'View Instructions' : 'Allow Access')}</>}
                                </button>
                            </div>
                        </div>

                        <div className="form-section-title">Passwords</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <PasswordInput name="password" label="Password (min 8 chars)" value={formData.password} onChange={handleChange} required minLength={8} autoComplete="new-password" />
                            <PasswordInput name="password_confirm" label="Confirm Password" value={formData.password_confirm} onChange={handleChange} required minLength={8} autoComplete="new-password" />
                        </div>

                        {/* High-Fidelity Documents Section */}
                        <div className="form-section-title">Verification Uploads</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: 'Business License', name: 'business_license' },
                                { label: 'Food Safety Certificate', name: 'food_safety_certificate' },
                                { label: 'Owner ID Proof', name: 'owner_id_proof' }
                            ].map(field => {
                                const file = docs[field.name];
                                return (
                                    <label key={field.name} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px',
                                        background: file ? '#fff7ed' : '#ffffff',
                                        border: file ? '2px solid #F97316' : '1px dashed #cbd5e1',
                                        borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s ease',
                                        boxShadow: file ? '0 4px 12px rgba(249,115,22,0.1)' : 'none'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 12, background: file ? '#F97316' : '#f1f5f9', color: file ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                                                {file ? <FileText size={24} /> : <Upload size={24} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                                                    {field.label}
                                                </div>
                                                <div style={{ fontSize: 13, color: file ? '#F97316' : '#94a3b8', fontWeight: file ? 600 : 400 }}>
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
                                            <div style={{ padding: '6px', borderRadius: '50%', background: '#F97316', color: 'white' }}>
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
                        Already have an account? <Link to="/login" style={{ color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
export default RegisterPage;
"""
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(pre_return + new_return)

process_restaurant()
print("Restaurant generated")
