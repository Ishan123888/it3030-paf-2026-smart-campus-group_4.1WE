import React, { useState, useEffect, useMemo, useRef } from 'react';
import emailjs from '@emailjs/browser';
import BackgroundSlideshow, { DEFAULT_SLIDES } from '../components/common/BackgroundSlideshow';
import { IconClock, IconMail, IconMapPin } from '../components/common/Icons';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const subjects = [
    "Booking Issue",
    "Incident / Ticket",
    "Account / Access",
    "Bug Report",
    "Other"
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const contacts = useMemo(
    () => [
      { icon: <IconMail size={16} />, label: 'Email', value: 'support@sliit.lk' },
      { icon: <IconMapPin size={16} />, label: 'Location', value: 'SLIIT, Malabe, Sri Lanka' },
      { icon: <IconClock size={16} />, label: 'Hours', value: 'Mon - Fri, 8am - 5pm' },
    ],
    []
  );

  useEffect(() => {
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject) {
      setError('Please select a subject.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
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
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            {contacts.map((c) => (
              <div key={c.label} className="card-3d flex items-center gap-4 rounded-2xl border border-white/15 bg-black/35 p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,.25)] backdrop-blur">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-[var(--accent2)] ring-1 ring-white/10">
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold tracking-[0.18em] text-white/60 uppercase">{c.label}</div>
                  <div className="mt-1 truncate text-sm font-semibold text-white/90">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-3d rounded-3xl border border-white/15 bg-black/35 p-6 shadow-[0_18px_60px_rgba(0,0,0,.28)] backdrop-blur lg:col-span-2 sm:p-8">
            <h2 className="text-lg font-extrabold tracking-tight text-white">Send a message</h2>
            
            {sent && <div className="mt-5 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-bold text-emerald-200">✓ Message sent successfully!</div>}
            {error && <div className="mt-5 rounded-xl border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm font-bold text-red-200">✗ {error}</div>}

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Full name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent2)]/60"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    type="email"
                    className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent2)]/60"
                    required
                  />
                </div>
              </div>

              {/* MODERN CUSTOM DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Subject</label>
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`mt-2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm transition-all duration-300 ${isDropdownOpen ? 'border-[var(--accent2)]/60 ring-1 ring-[var(--accent2)]/20' : ''}`}
                >
                  <span className={form.subject ? "text-white" : "text-white/35"}>
                    {form.subject || "Select a topic..."}
                  </span>
                  <svg className={`h-4 w-4 text-white/40 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0d151c] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all">
                    {subjects.map((s) => (
                      <div
                        key={s}
                        onClick={() => { setForm({ ...form, subject: s }); setIsDropdownOpen(false); }}
                        className="cursor-pointer px-4 py-3 text-sm text-white/70 hover:bg-[var(--accent2)] hover:text-[#061018] transition-colors duration-200"
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold tracking-[0.18em] text-white/60 uppercase">Message</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[var(--accent2)]/60"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[var(--accent2)] py-3.5 text-sm font-extrabold text-[#061018] shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {loading ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </BackgroundSlideshow>
  );
}