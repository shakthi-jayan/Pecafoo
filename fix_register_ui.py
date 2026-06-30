import os
import re

def process_restaurant():
    path = r"c:\Users\Machodev\Documents\Pecafoo\frontend\restaurant-app\src\pages\RegisterPage.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # The layout for restaurant
    new_return = """return (
        <div className="premium-register-layout">
            <style>{`
                .premium-register-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', sans-serif;
                }
                .premium-register-left {
                    flex: 0 0 40%;
                    background: #ffffff;
                    padding: 4vw;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-right: 1px solid #f1f5f9;
                }
                .premium-register-right {
                    flex: 1;
                    padding: 4vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .premium-register-card {
                    width: 100%;
                    max-width: 640px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 40px;
                    border-radius: 28px;
                    box-shadow: 0 20px 40px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02);
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
                    background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin-top: 24px;
                }
                .premium-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.25);
                }
                .premium-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .benefit-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 24px;
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
                @media (max-width: 992px) {
                    .premium-register-layout { flex-direction: column; }
                    .premium-register-left { flex: none; padding: 40px 24px; border-right: none; border-bottom: 1px solid #f1f5f9; }
                    .premium-register-right { padding: 24px; }
                    .premium-register-card { padding: 32px 24px; }
                }
            `}</style>
            
            <div className="premium-register-left">
                <div style={{ maxWidth: 420, margin: '0 auto' }}>
                    <p style={{ color: '#F97316', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Pecafoo for Restaurants</p>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, color: '#0f172a' }}>
                        Grow your business.
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.5, marginBottom: 40 }}>
                        Join thousands of restaurants reaching more customers and boosting revenue every day.
                    </p>
                    
                    <div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><BarChart3 size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>More Orders</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Reach thousands of hungry customers in your area instantly.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ChefHat size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Easy Menu Management</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Update your offerings, prices, and availability in real-time.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Fast Verification</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Quick onboarding process to get you selling as soon as possible.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="premium-register-right">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-register-card">
                    
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <AuthProgress steps={['Details', 'Location', 'Verify']} current={1} brandColor="#F97316" />
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: 16, marginBottom: 8 }}>Restaurant Information</h2>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>Create your restaurant partner account.</p>
                    </div>

                    {accountExists ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '32px', background: '#f8fafc', borderRadius: 20 }}>
                            <div style={{ marginBottom: 16 }}>
                                <AlertCircle size={40} color="#F97316" style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Account Found!</h3>
                            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
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
                    <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput name="first_name" label="First Name" value={formData.first_name} onChange={handleChange} required />
                            <FloatingInput name="last_name" label="Last Name" value={formData.last_name} onChange={handleChange} required />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput type="email" name="email" label="Email Address" value={formData.email} onChange={handleChange} required autoComplete="email" />
                            <FloatingInput type="tel" name="phone_number" label="Mobile Number" value={formData.phone_number} onChange={handlePhoneChange} required />
                        </div>
                        
                        <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                        
                        <FloatingInput name="restaurant_name" label="Restaurant Name" value={formData.restaurant_name} onChange={handleChange} required />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                            <FloatingInput name="cuisine_type" label="Cuisine Type (e.g., Indian, Chinese)" value={formData.cuisine_type} onChange={handleChange} />
                            <FloatingInput type="tel" name="restaurant_phone" label="Restaurant Phone" value={formData.restaurant_phone} onChange={handleChange} />
                        </div>
                        
                        <FloatingInput name="description" label="Short Description" value={formData.description} onChange={handleChange} />
                        
                        <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                        
                        <FloatingInput name="address" label="Street Address" value={formData.address} onChange={handleChange} required />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            <FloatingInput name="city" label="City" value={formData.city} onChange={handleChange} required />
                            <FloatingInput name="state" label="State" value={formData.state} onChange={handleChange} required />
                            <FloatingInput name="pincode" label="Pincode" value={formData.pincode} onChange={handleChange} required />
                        </div>
                        
                        {/* Location Widget */}
                        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: formData.latitude ? '1px solid #10b981' : (permissionBlocked ? '1px solid #f59e0b' : '1px solid #e2e8f0') }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <MapPin size={16} color={permissionBlocked ? '#f59e0b' : '#F97316'} />
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Restaurant Location</span>
                                        {!formData.latitude && (
                                            <span style={{ fontSize: '11px', background: permissionBlocked ? '#fef3c7' : '#fee2e2', color: permissionBlocked ? '#92400e' : '#ef4444', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{permissionBlocked ? 'Blocked' : 'Required'}</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '13px', color: formData.latitude ? '#10b981' : (permissionBlocked ? '#92400e' : '#64748b') }}>
                                        {formData.latitude ? `Lat: ${Number(formData.latitude).toFixed(4)}, Lng: ${Number(formData.longitude).toFixed(4)}` : (permissionBlocked ? 'Location access is blocked.' : 'Required for delivery routing')}
                                    </div>
                                </div>
                                <button type="button" onClick={fetchLocation} disabled={fetchingLocation} style={{
                                    padding: '8px 16px', fontSize: '14px', background: formData.latitude ? '#ffffff' : (permissionBlocked ? '#fef3c7' : '#F97316'),
                                    color: formData.latitude ? '#0f172a' : (permissionBlocked ? '#92400e' : 'white'),
                                    border: formData.latitude ? '1px solid #e2e8f0' : (permissionBlocked ? '1px solid #f59e0b' : 'none'),
                                    borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer'
                                }}>
                                    {fetchingLocation ? <><Loader2 size={14} className="spin" /> Fetching...</> : <><MapPin size={14} /> {formData.latitude ? 'Update' : (permissionBlocked ? 'Instructions' : 'Allow Access')}</>}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <PasswordInput name="password" label="Password (min 8 chars)" value={formData.password} onChange={handleChange} required minLength={8} autoComplete="new-password" />
                            <PasswordInput name="password_confirm" label="Confirm Password" value={formData.password_confirm} onChange={handleChange} required minLength={8} autoComplete="new-password" />
                        </div>

                        {/* Documents Section */}
                        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <FileText size={18} color="#F97316" />
                                <strong style={{ fontSize: '15px', color: '#0f172a' }}>Verification Documents</strong>
                            </div>
                            <FileField label="Business License" name="business_license" />
                            <FileField label="Food Safety Certificate" name="food_safety_certificate" />
                            <FileField label="Owner ID Proof" name="owner_id_proof" />
                        </div>

                        <button type="submit" className="premium-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
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
}"""

    # Replace the return block
    new_content = re.sub(r'return\s*\(\s*<PremiumAuthLayout[\s\S]+?\);\n\};?', new_return, content)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

def process_delivery():
    path = r"c:\Users\Machodev\Documents\Pecafoo\frontend\delivery-app\src\pages\RegisterPage.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    new_return = """return (
        <div className="premium-register-layout">
            <style>{`
                .premium-register-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', sans-serif;
                }
                .premium-register-left {
                    flex: 0 0 40%;
                    background: #ffffff;
                    padding: 4vw;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-right: 1px solid #f1f5f9;
                }
                .premium-register-right {
                    flex: 1;
                    padding: 4vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .premium-register-card {
                    width: 100%;
                    max-width: 640px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 40px;
                    border-radius: 28px;
                    box-shadow: 0 20px 40px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02);
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
                    background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin-top: 24px;
                }
                .premium-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.25);
                }
                .premium-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .benefit-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 24px;
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
                @media (max-width: 992px) {
                    .premium-register-layout { flex-direction: column; }
                    .premium-register-left { flex: none; padding: 40px 24px; border-right: none; border-bottom: 1px solid #f1f5f9; }
                    .premium-register-right { padding: 24px; }
                    .premium-register-card { padding: 32px 24px; }
                }
            `}</style>
            
            <div className="premium-register-left">
                <div style={{ maxWidth: 420, margin: '0 auto' }}>
                    <p style={{ color: '#22C55E', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Pecafoo Delivery Partner</p>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, color: '#0f172a' }}>
                        Flexible work, on your terms.
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.5, marginBottom: 40 }}>
                        Set up your partner profile once and start earning when it works for you.
                    </p>
                    
                    <div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><Navigation size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Choose your momentum</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Go online and accept deliveries whenever you are ready.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><WalletCards size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Transparent earnings</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Clear daily and weekly totals delivered right to your dashboard.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Simple verification</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Your documents stay secure, grouped, and visible.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="premium-register-right">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-register-card">
                    
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <AuthProgress steps={['Account', 'Vehicle', 'Verify']} current={1} brandColor="#22C55E" />
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: 16, marginBottom: 8 }}>Join as Partner</h2>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>Create your account and upload verification documents.</p>
                    </div>

                    {accountExists ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '32px', background: '#f8fafc', borderRadius: 20 }}>
                            <div style={{ marginBottom: 16 }}>
                                <User size={40} color="#22C55E" style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Account Found!</h3>
                            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
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
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput id="first_name" name="first_name" label="First Name" value={fd.first_name} onChange={ch} required />
                            <FloatingInput id="last_name" name="last_name" label="Last Name" value={fd.last_name} onChange={ch} required />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput id="email" type="email" name="email" label="Email Address" value={fd.email} onChange={ch} required autoComplete="email" />
                            <FloatingInput id="phone_number" type="tel" name="phone_number" label="Mobile Number" value={fd.phone_number} onChange={handlePhoneChange} required />
                        </div>
                        
                        <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <select name="vehicle_type" value={fd.vehicle_type} onChange={ch} style={{ height: '56px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '0 16px', fontSize: '16px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}>
                                    <option value="bicycle">Bicycle</option>
                                    <option value="motorcycle">Motorcycle</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                            <FloatingInput id="vehicle_number" name="vehicle_number" label="Vehicle Number" value={fd.vehicle_number} onChange={ch} />
                        </div>
                        <FloatingInput id="license_number" name="license_number" label="License Number" value={fd.license_number} onChange={ch} />
                        
                        <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <PasswordInput id="password" name="password" label="Password (min 8 chars)" value={fd.password} onChange={ch} required minLength={8} autoComplete="new-password" />
                            <PasswordInput id="password_confirm" name="password_confirm" label="Confirm Password" value={fd.password_confirm} onChange={ch} required minLength={8} autoComplete="new-password" />
                        </div>

                        {/* Documents Section */}
                        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <FileText size={18} color="#22C55E" />
                                <strong style={{ fontSize: '15px', color: '#0f172a' }}>Verification Documents</strong>
                            </div>
                            <FileField label="ID Proof" name="id_proof" />
                            <FileField label="Driving License / Vehicle Permit" name="license_image" />
                        </div>

                        <button type="submit" className="premium-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
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

    new_content = re.sub(r'return\s*\(\s*<PremiumAuthLayout[\s\S]+?\);\n\}', new_return, content)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

process_restaurant()
process_delivery()
print("Done")
