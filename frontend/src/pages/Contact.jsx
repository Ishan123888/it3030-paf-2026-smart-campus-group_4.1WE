import React, { useState, useEffect, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import BackgroundSlideshow, { DEFAULT_SLIDES } from '../components/common/BackgroundSlideshow';
import { IconClock, IconMail, IconMapPin } from '../components/common/Icons';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Define contacts array inside useMemo to fix "contacts is not defined" error
  const contacts = useMemo(
    () => [
      { icon: <IconMail size={16} />, label: 'Email', value: 'support@sliit.lk' },
      { icon: <IconMapPin size={16} />, label: 'Location', value: 'SLIIT, Malabe, Sri Lanka' },
      { icon: <IconClock size={16} />, label: 'Hours', value: 'Mon - Fri, 8am - 5pm' },
    ],
    []
  );

  // Initialize EmailJS with REACT_APP prefix for Webpack
  useEffect(() => {
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Using process.env for Create React App
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          name: form.name,
          email: form.email,
          title: form.subject,
          message: form.message,
        }
      );
      
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      window.setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Email error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundSlideshow slides={DEFAULT_SLIDES} className="min-h-screen pt-16">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-extrabold tracking-[0.22em] text-white/85 uppercase backdrop-blur">
            Support & Contact
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Get in <span className="text-[var(--accent2)]">Touch</span>
          </h1>
          <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">
            Having issues with bookings, incidents, or account access? We're here to help.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            {/* Display Contact Info Cards */}
            {contacts.map((c) => (
              <div
                key={c.label}
                className="card-3d flex items-center gap-4 rounded-2xl border border-white/15 bg-black/35 p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,.25)] backdrop-blur"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-[var(--accent2)] ring-1 ring-white/10">
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold tracking-[0.18em] text-white/60 uppercase">{c.label}</div>
                  <div className="mt-1 truncate text-sm font-semibold text-white/90">{c.value}</div>
                </div>
              </div>
            ))}

            <div className="card-3d overflow-hidden rounded-2xl border border-white/15 bg-black/35 p-4 shadow-[0_18px_60px_rgba(0,0,0,.25)] backdrop-blur">
              <iframe
                title="SLIIT Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798511776515!2d79.970364275044!3d6.914677493084813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae256db1a677115%3A0x2c63e3442e653f7c!2sSLIIT!5e0!3m2!1sen!2slk!4v1712720000000!5m2!1sen!2slk"
                width="100%"
                height="220"
                style={{ border: 'none', borderRadius: 14, filter: 'invert(0.9) hue-rotate(180deg)' }}
                loading="lazy"
              />
            </div>
          </div>

          <div className="card-3d rounded-3xl border border-white/15 bg-black/35 p-6 shadow-[0_18px_60px_rgba(0,0,0,.28)] backdrop-blur lg:col-span-2 sm:p-8">
            <h2 className="text-lg font-extrabold tracking-tight text-white">Send a message</h2>
            <p className="mt-1 text-sm text-white/65">We usually reply within 24 hours.</p>

            {sent && (
              <div className="mt-5 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-200">
                ✓ Message sent! We'll get back to you soon.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm font-bold text-red-200">
                ✗ {error}
              </div>
            )}

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Full name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--accent2)]/60"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@sliit.lk"
                    type="email"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--accent2)]/60"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent2)]/60"
                  required
                >
                  <option value="" disabled>Select a topic...</option>
                  <option value="Booking Issue">Booking Issue</option>
                  <option value="Incident / Ticket">Incident / Ticket</option>
                  <option value="Account / Access">Account / Access</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Message</label>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--accent2)]/60"
                  required
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent2)] px-5 py-3 text-sm font-extrabold text-[#061018] shadow-[0_14px_40px_rgba(0,229,195,.18)] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BackgroundSlideshow>
  );
}