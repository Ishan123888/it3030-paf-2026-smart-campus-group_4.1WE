import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import BackgroundSlideshow, { DEFAULT_SLIDES } from '../components/common/BackgroundSlideshow';
import { IconChevronRight } from '../components/common/Icons';

export default function Login() {
  const { user, loading, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  const [mode, setMode] = useState('login'); // login | register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.pathname === '/oauth-callback') return;
    if (!loading && user) {
      if (user.roles?.includes('ROLE_ADMIN')) navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate, location.pathname]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      if (mode === 'register') {
        await api.post('/auth/register', { name, email, password, role });
        setFormSuccess('Registered successfully! Please login.');
        setMode('login');
        setName('');
        setPassword('');
      } else {
        const res = await api.post('/auth/login', { email, password });
        await loginWithToken(res.data.token);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const accessLevels = useMemo(
    () => [
      { role: 'Admin', color: '#ef4444', desc: 'Full system access' },
      { role: 'Staff', color: '#00e5c3', desc: 'Module management' },
      { role: 'Student', color: '#4f6fff', desc: 'Bookings & incidents' },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] grid place-items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[var(--accent2)]" />
      </div>
    );
  }

  return (
    <BackgroundSlideshow slides={DEFAULT_SLIDES} className="min-h-screen grid place-items-center px-4 py-14">
      <div className="w-full max-w-md">
        <div className="card-3d rounded-3xl border border-white/15 bg-black/35 p-7 shadow-[0_18px_70px_rgba(0,0,0,.35)] backdrop-blur sm:p-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-extrabold tracking-[0.22em] text-white/85 uppercase">
              Smart Campus Hub
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
              {mode === 'register' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              {mode === 'register' ? 'Register with your SLIIT email to continue.' : 'Sign in to access your dashboard.'}
            </p>
          </div>

          {(error || formError) && (
            <div className="mt-5 rounded-xl border border-red-300/25 bg-red-300/10 px-4 py-3 text-sm font-bold text-red-200">
              {error ? 'OAuth login failed. Please try again.' : formError}
            </div>
          )}
          {formSuccess && (
            <div className="mt-5 rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-200">
              {formSuccess}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={[
                'rounded-xl px-4 py-2 text-xs font-extrabold tracking-[0.18em] uppercase transition',
                mode === 'login' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white',
              ].join(' ')}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={[
                'rounded-xl px-4 py-2 text-xs font-extrabold tracking-[0.18em] uppercase transition',
                mode === 'register' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white',
              ].join(' ')}
            >
              Register
            </button>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--accent2)]/60"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@sliit.lk"
                type="email"
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--accent2)]/60"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs font-extrabold text-white/60 hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter password'}
                type={showPassword ? 'text' : 'password'}
                className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--accent2)]/60"
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent2)]/60"
                >
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Staff</option>
                </select>
                <p className="mt-2 text-xs text-white/55">Admin accounts are managed separately.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent2)] px-5 py-3 text-sm font-extrabold text-[#061018] shadow-[0_14px_40px_rgba(0,229,195,.18)] hover:opacity-95 disabled:opacity-60"
            >
              {submitting
                ? mode === 'register'
                  ? 'Registering…'
                  : 'Logging in…'
                : mode === 'register'
                  ? 'Create account'
                  : 'Login'}
              <IconChevronRight size={18} />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-extrabold tracking-[0.18em] text-white/45">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-white/95"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/login')}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-extrabold text-amber-300 hover:bg-amber-500/20"
          >
            🔐 Admin Login
          </button>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] font-extrabold tracking-[0.18em] text-white/55 uppercase">Access levels</div>
            <div className="mt-3 space-y-2">
              {accessLevels.map((r) => (
                <div key={r.role} className="flex items-center gap-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                    style={{ background: `${r.color}18`, color: r.color }}
                  >
                    {r.role}
                  </span>
                  <span className="text-xs text-white/65">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-6 text-white/50">
            Only authorized SLIIT members can access this system.
          </p>
        </div>
      </div>
    </BackgroundSlideshow>
  );
}

