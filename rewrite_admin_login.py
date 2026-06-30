import re

def process_admin_login():
    path = r"c:\Users\Machodev\Documents\Pecafoo\frontend\admin-app\src\App.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Inject missing lucide icons
    if 'Mail,' not in content:
        content = re.sub(
            r"import\s*\{([^\}]+)\}\s*from\s*'lucide-react';",
            lambda m: f"import {{{m.group(1).rstrip(',')}, Mail, Lock, Zap, Check}} from 'lucide-react';",
            content
        )

    # Find the LoginPage function
    match = re.search(r'(function LoginPage\(\)\s*\{.*?)(return\s*\(\s*<PremiumAuthLayout.*?\);\s*\})', content, re.DOTALL)
    
    if not match:
        print("Could not find LoginPage or return block in App.jsx")
        return
        
    pre_return = match.group(1)
    
    # We need to inject rememberMe state into the pre_return block
    # It currently has:
    # const [password, setPassword] = useState('');
    # const [loading, setLoading] = useState(false);
    if "rememberMe" not in pre_return:
        pre_return = pre_return.replace(
            "const [loading, setLoading] = useState(false);",
            "const [loading, setLoading] = useState(false);\n  const [rememberMe, setRememberMe] = useState(false);"
        )

    new_return = """return (
    <div className="admin-login-layout">
      <style>{`
        .admin-login-layout {
          display: flex;
          align-items: stretch;
          justify-content: center;
          min-height: 100vh;
          background-color: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow: hidden;
        }
        .admin-left {
          flex: 0 0 50%;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px;
          border-right: 1px solid #e2e8f0;
          position: relative;
        }
        .admin-left::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.03), transparent 70%);
          pointer-events: none;
        }
        .admin-left-content {
          max-width: 440px;
          margin: 0 auto;
          width: 100%;
        }
        .admin-right {
          flex: 0 0 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          background: #f8fafc;
        }
        .admin-card {
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          padding: 48px;
          border-radius: 28px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 24px 48px -12px rgba(0,0,0,0.05), 0 4px 24px rgba(0,0,0,0.02);
        }
        .admin-feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 32px;
        }
        .admin-feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #eff6ff;
          color: #2563EB;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .apple-input-group {
          position: relative;
          margin-bottom: 20px;
        }
        .apple-input {
          width: 100%;
          height: 56px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 0 16px 0 48px;
          font-size: 15px;
          color: #0f172a;
          transition: all 0.2s ease;
          outline: none;
        }
        .apple-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
          background: #ffffff;
        }
        .apple-input::placeholder {
          color: #94a3b8;
        }
        .apple-input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .apple-input:focus ~ .apple-input-icon {
          color: #2563EB;
        }
        .admin-btn {
          width: 100%;
          height: 56px;
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 12px;
        }
        .admin-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
          background: #1d4ed8;
        }
        .admin-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .custom-checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }
        .checkbox-box {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s ease;
        }
        .custom-checkbox input:checked + .checkbox-box {
          background: #2563EB;
          border-color: #2563EB;
        }
        .admin-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 32px 0;
        }
        
        @media (max-width: 1023px) {
          .admin-login-layout { flex-direction: column; }
          .admin-left { display: none; }
          .admin-right { flex: none; width: 100%; min-height: 100vh; padding: 24px; }
          .admin-card { padding: 32px 24px; box-shadow: 0 12px 32px -8px rgba(0,0,0,0.08); }
        }
      `}</style>
      
      <div className="admin-left">
        <div className="admin-left-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, background: '#1e3a8a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ShieldCheck size={22} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: '#1e3a8a' }}>PECAFOO OPERATIONS</span>
          </div>
          
          <h1 style={{ fontSize: '46px', fontWeight: 800, lineHeight: 1.1, color: '#0f172a', marginBottom: 24, letterSpacing: '-0.02em' }}>
            The entire platform,<br/>under one dashboard.
          </h1>
          <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.6, marginBottom: 56 }}>
            Monitor restaurants, delivery partners, customers and business operations from one secure workspace.
          </p>

          <div className="admin-feature">
            <div className="admin-feature-icon"><ShieldCheck size={24} /></div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Secure Administration</h3>
              <p style={{ fontSize: 15, color: '#64748b', margin: 0, lineHeight: 1.5 }}>Role-based secure access for platform oversight.</p>
            </div>
          </div>
          <div className="admin-feature">
            <div className="admin-feature-icon"><Activity size={24} /></div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Live Analytics</h3>
              <p style={{ fontSize: 15, color: '#64748b', margin: 0, lineHeight: 1.5 }}>Monitor orders and revenue in real time.</p>
            </div>
          </div>
          <div className="admin-feature">
            <div className="admin-feature-icon"><ServerCog size={24} /></div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Marketplace Control</h3>
              <p style={{ fontSize: 15, color: '#64748b', margin: 0, lineHeight: 1.5 }}>Restaurants, deliveries and customers in context.</p>
            </div>
          </div>
          <div className="admin-feature">
            <div className="admin-feature-icon"><Zap size={24} /></div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Instant Actions</h3>
              <p style={{ fontSize: 15, color: '#64748b', margin: 0, lineHeight: 1.5 }}>Approve, suspend and manage accounts instantly.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-right">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="admin-card">
          
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 20px', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <ShieldCheck size={28} />
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>Admin Panel</h2>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Pecafoo Management Console</p>
          </div>

          <form onSubmit={handle}>
            <div className="apple-input-group">
              <input
                type="email"
                className="apple-input"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Mail size={20} className="apple-input-icon" />
            </div>
            
            <div className="apple-input-group">
              <input
                type="password"
                className="apple-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Lock size={20} className="apple-input-icon" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, marginTop: 12 }}>
              <label className="custom-checkbox">
                <input type="checkbox" style={{ display: 'none' }} checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <div className="checkbox-box">
                  {rememberMe && <Check size={14} strokeWidth={3} />}
                </div>
                <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>Remember me</span>
              </label>
              
              <Link to="#" onClick={(e) => { e.preventDefault(); toast('Password reset is managed by Super Admins.', { icon: '🔒' }) }} style={{ fontSize: 14, color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="admin-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="admin-divider" />
          
          <div style={{ textAlign: 'center' }}>
            <Link to="/register" style={{ display: 'inline-block', padding: '10px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, color: '#334155', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}>
              Bootstrap Admin
            </Link>
            <p style={{ marginTop: 24, fontSize: 13, color: '#94a3b8' }}>
              Need help? <a href="#" style={{ color: '#64748b', textDecoration: 'underline' }}>Contact System Administrator</a>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}"""

    # Replace the return block
    new_content = pre_return + new_return
    
    # Replace the whole old function with the newly constructed one
    # Note: we need to append the rest of the file after the LoginPage function
    post_return = content[match.end():]
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content + post_return)

process_admin_login()
print("Admin Login UI redesigned")
