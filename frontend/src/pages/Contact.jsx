import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate send (connect to backend if needed)
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const contacts = [
    { icon: '📧', label: 'Email', value: 'support@sliit.lk' },
    { icon: '📞', label: 'Phone', value: '+94 11 754 4801' },
    { icon: '📍', label: 'Location', value: 'SLIIT, Malabe, Sri Lanka' },
    { icon: '⏰', label: 'Hours', value: 'Mon–Fri, 8am–5pm' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#060812', paddingTop: 60, fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '52px 24px 40px' }}>
        <div style={{
          display: 'inline-block', padding: '4px 16px', borderRadius: 100,
          background: 'rgba(79,111,255,0.1)', border: '1px solid rgba(79,111,255,0.3)',
          color: '#a3b5ff', fontSize: 12, fontWeight: 600, letterSpacing: '0.07em',
          textTransform: 'uppercase', marginBottom: 20
        }}>Support & Contact</div>
        <h1 style={{ color: '#e8ecff', fontSize: 36, fontWeight: 800, margin: '0 0 12px', letterSpacing: -1 }}>
          Get in <span style={{ color: '#4f6fff' }}>Touch</span>
        </h1>
        <p style={{ color: '#6b7599', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
          Having issues with bookings, incidents, or account access? We're here to help.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 28 }}>

        {/* Left: Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {contacts.map(c => (
            <div key={c.label} style={{
              background: 'rgba(13,17,32,0.9)', border: '1px solid rgba(99,130,255,0.15)',
              borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, fontSize: 20,
                background: 'rgba(79,111,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{c.icon}</div>
              <div>
                <div style={{ color: '#6b7599', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</div>
                <div style={{ color: '#e8ecff', fontSize: 15, fontWeight: 500, marginTop: 2 }}>{c.value}</div>
              </div>
            </div>
          ))}

          {/* Map placeholder */}
          <div style={{
            background: 'rgba(13,17,32,0.9)', border: '1px solid rgba(99,130,255,0.15)',
            borderRadius: 14, padding: 20, marginTop: 4, flex: 1
          }}>
            <iframe
              title="SLIIT Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.4!2d79.9718!3d6.9147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zSUlU!5e0!3m2!1sen!2slk!4v1"
              width="100%" height="200" style={{ border: 'none', borderRadius: 10, filter: 'invert(0.9) hue-rotate(180deg)' }}
              loading="lazy"
            />
          </div>
        </div>

        {/* Right: Form */}
        <div style={{
          background: 'rgba(13,17,32,0.9)', border: '1px solid rgba(99,130,255,0.15)',
          borderRadius: 16, padding: 32
        }}>
          <h2 style={{ color: '#e8ecff', fontSize: 22, fontWeight: 700, margin: '0 0 24px' }}>Send a Message</h2>

          {sent && (
            <div style={{
              background: 'rgba(0,229,195,0.1)', border: '1px solid rgba(0,229,195,0.3)',
              borderRadius: 10, padding: '12px 16px', color: '#00e5c3',
              fontSize: 14, fontWeight: 600, marginBottom: 20
            }}>
              ✓ Message sent! We'll get back to you within 24 hours.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Name + Email row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
                { key: 'email', label: 'Email Address', placeholder: 'john@sliit.lk' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: '#6b7599', fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,130,255,0.2)',
                      borderRadius: 8, color: '#e8ecff', fontSize: 14, outline: 'none',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Subject */}
            <div>
              <label style={{ display: 'block', color: '#6b7599', fontSize: 13, marginBottom: 6 }}>Subject</label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,130,255,0.2)',
                  borderRadius: 8, color: form.subject ? '#e8ecff' : '#6b7599',
                  fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif"
                }}
              >
                <option value="" style={{ background: '#0d1120' }}>Select a topic...</option>
                <option value="booking" style={{ background: '#0d1120' }}>Booking Issue</option>
                <option value="incident" style={{ background: '#0d1120' }}>Incident / Ticket</option>
                <option value="account" style={{ background: '#0d1120' }}>Account / Access</option>
                <option value="bug" style={{ background: '#0d1120' }}>Bug Report</option>
                <option value="other" style={{ background: '#0d1120' }}>Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label style={{ display: 'block', color: '#6b7599', fontSize: 13, marginBottom: 6 }}>Message</label>
              <textarea
                rows={6}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your issue in detail..."
                style={{
                  width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,130,255,0.2)',
                  borderRadius: 8, color: '#e8ecff', fontSize: 14, outline: 'none',
                  fontFamily: "'DM Sans', sans-serif", resize: 'vertical'
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              style={{
                padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #4f6fff, #7b6fff)',
                color: '#fff', fontWeight: 700, fontSize: 15,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 4px 20px rgba(79,111,255,0.35)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Send Message →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}