import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { approveBooking, cancelBooking, getAllBookings, rejectBooking } from '../../api/api';

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const PAGE_SIZE = 10;

export default function AdminBookingsPage() {
  const [bookings,         setBookings]         = useState([]);
  const [status,           setStatus]           = useState('ALL');
  const [userEmail,        setUserEmail]        = useState('');
  const [bookingDate,      setBookingDate]      = useState('');
  const [message,          setMessage]          = useState('');
  const [loading,          setLoading]          = useState(true);
  const [page,             setPage]             = useState(1);
  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectReason,     setRejectReason]     = useState('');

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3500);
  };

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== 'ALL')   params.status      = status;
      if (userEmail.trim())   params.userEmail   = userEmail.trim();
      if (bookingDate)        params.bookingDate = bookingDate;
      const res = await getAllBookings(params);
      setBookings(res.data || []);
      setPage(1);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [bookingDate, status, userEmail]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const summary = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === 'PENDING').length,
    approved:  bookings.filter((b) => b.status === 'APPROVED').length,
    rejected:  bookings.filter((b) => b.status === 'REJECTED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
  }), [bookings]);

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === 'PENDING'),
    [bookings]
  );

  const clearFilters = () => {
    setStatus('ALL');
    setUserEmail('');
    setBookingDate('');
    setMessage('');
  };

  const counts = FILTERS.slice(1).reduce((acc, f) => {
    acc[f] = bookings.filter((b) => b.status === f).length;
    return acc;
  }, {});

  const totalPages = Math.ceil(bookings.length / PAGE_SIZE);
  const paged      = bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleApprove = async (bookingId) => {
    try {
      await approveBooking(bookingId);
      showMessage('✅ Booking approved successfully.');
      loadBookings();
    } catch (err) {
      showMessage(err.response?.data?.message || '❌ Unable to approve booking.');
    }
  };

  const openRejectModal  = (booking) => { setRejectingBooking(booking); setRejectReason(''); };
  const closeRejectModal = ()         => { setRejectingBooking(null);   setRejectReason(''); };

  const handleReject = async () => {
    if (!rejectingBooking || !rejectReason.trim()) return;
    try {
      await rejectBooking(rejectingBooking.id, rejectReason.trim());
      showMessage('✅ Booking rejected successfully.');
      closeRejectModal();
      loadBookings();
    } catch (err) {
      showMessage(err.response?.data?.message || '❌ Unable to reject booking.');
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(bookingId);
      showMessage('✅ Booking cancelled successfully.');
      loadBookings();
    } catch (err) {
      showMessage(err.response?.data?.message || '❌ Unable to cancel booking.');
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <AdminLayout title="Booking Management">

      {/* Hero */}
      <div style={s.hero}>
        <div>
          <div style={s.eyebrow}>Module B</div>
          <h1 style={s.title}>Booking Approval Center</h1>
          <p style={s.sub}>Review pending requests, approve them quickly, reject with a clear reason, or cancel active bookings when needed.</p>
        </div>
        <div style={s.heroMeta}>
          <span style={s.heroPill}>Pending Queue: {summary.pending}</span>
          <span style={s.heroPill}>Today Filters Ready</span>
        </div>
      </div>

      {/* Stat cards */}
      <div style={s.statsGrid}>
        <StatCard label="Total Requests"        value={summary.total}                         tone="blue"  />
        <StatCard label="Pending Review"        value={summary.pending}                       tone="amber" />
        <StatCard label="Approved"              value={summary.approved}                      tone="green" />
        <StatCard label="Rejected / Cancelled"  value={summary.rejected + summary.cancelled}  tone="slate" />
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.filterRow}>
          {FILTERS.map((item) => (
            <button key={item} onClick={() => setStatus(item)}
              style={{ ...s.chip, ...(status === item ? s.chipActive : {}) }}>
              {item}{item !== 'ALL' && ` (${counts[item] ?? 0})`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Filter by student email"
            style={s.input}
          />
          <input
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            style={s.input}
          />
          <button onClick={loadBookings} style={s.searchBtn}>Apply</button>
          <button onClick={clearFilters} style={s.secondaryBtn}>Reset</button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          background: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
          color:  message.includes('✅') ? '#15803d'  : '#dc2626',
          fontSize: 14, fontWeight: 600,
        }}>
          {message}
        </div>
      )}

      {/* Pending Queue */}
      <div style={s.panel}>
        <div style={s.sectionHead}>
          <div>
            <h2 style={s.sectionTitle}>Pending Approval Queue</h2>
            <p style={s.sectionSub}>Students waiting for admin action appear here first.</p>
          </div>
          <span style={s.queueCount}>{pendingBookings.length} pending</span>
        </div>

        {loading ? (
          <div style={s.loading}>Loading booking requests...</div>
        ) : pendingBookings.length === 0 ? (
          <div style={s.emptyState}>No pending booking requests right now.</div>
        ) : (
          <div style={s.pendingGrid}>
            {pendingBookings.map((booking) => (
              <div key={booking.id} style={s.pendingCard}>
                <div style={s.pendingTop}>
                  <div>
                    <div style={s.cardTitle}>{booking.resourceName}</div>
                    <div style={s.cardSub}>{booking.bookingDate} | {booking.startTime} – {booking.endTime}</div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div style={s.pendingMeta}>
                  <MetaBlock label="Student"   value={booking.userName || booking.userEmail} />
                  <MetaBlock label="Email"     value={booking.userEmail} />
                  <MetaBlock label="Attendees" value={String(booking.expectedAttendees || 1)} />
                </div>

                <div style={s.reasonPanel}>
                  <div style={s.reasonLabel}>Purpose</div>
                  <div style={s.reasonValue}>{booking.purpose}</div>
                </div>

                <div style={s.actions}>
                  <button onClick={() => handleApprove(booking.id)}    style={s.approveBtn}>Approve</button>
                  <button onClick={() => openRejectModal(booking)}      style={s.rejectBtn}>Reject</button>
                  <button onClick={() => handleCancel(booking.id)}     style={s.cancelBtn}>Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Bookings Table */}
      <div style={s.tableWrap}>
        <div style={{ ...s.sectionHead, padding: '18px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h2 style={s.sectionTitle}>All Booking Requests</h2>
            <p style={s.sectionSub}>Review every request with status, reason, and available actions.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTop: '3px solid #4f6fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>No bookings found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['Resource', 'Student', 'Schedule', 'Purpose', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((b, idx) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={s.td}>
                    <div style={s.primaryText}>{b.resourceName}</div>
                    <div style={s.secondaryText}>Attendees: {b.expectedAttendees}</div>
                  </td>
                  <td style={s.td}>
                    <div style={s.primaryText}>{b.userName}</div>
                    <div style={s.secondaryText}>{b.userEmail}</div>
                  </td>
                  <td style={s.td}>
                    <div style={s.primaryText}>{b.bookingDate}</div>
                    <div style={s.secondaryText}>{b.startTime} – {b.endTime}</div>
                  </td>
                  <td style={{ ...s.td, maxWidth: 180 }}>
                    <div style={{ color: '#0f172a', fontSize: 13, wordBreak: 'break-word' }}>{b.purpose}</div>
                    {b.adminReason && <div style={s.reviewNote}>Reason: {b.adminReason}</div>}
                  </td>
                  <td style={s.td}>
                    <StatusBadge status={b.status} />
                    {b.reviewedBy && <div style={s.reviewNote}>By: {b.reviewedBy}</div>}
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      {b.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(b.id)}   style={s.approveBtn}>Approve</button>
                          <button onClick={() => openRejectModal(b)}     style={s.rejectBtn}>Reject</button>
                          <button onClick={() => handleCancel(b.id)}    style={s.cancelBtn}>Cancel</button>
                        </>
                      )}
                      {b.status === 'APPROVED'  && <button onClick={() => handleCancel(b.id)} style={s.cancelBtn}>Cancel</button>}
                      {b.status === 'REJECTED'  && <span style={s.secondaryText}>Rejected</span>}
                      {b.status === 'CANCELLED' && <span style={s.secondaryText}>Cancelled</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && bookings.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, bookings.length)} of {bookings.length} bookings
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: page === 1 ? '#f1f5f9' : '#fff', color: page === 1 ? '#94a3b8' : '#0f172a', fontWeight: 600, fontSize: 13, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid', borderColor: p === page ? '#4f6fff' : '#e2e8f0', background: p === page ? '#4f6fff' : '#fff', color: p === page ? '#fff' : '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: page === totalPages ? '#f1f5f9' : '#fff', color: page === totalPages ? '#94a3b8' : '#0f172a', fontWeight: 600, fontSize: 13, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingBooking && (
        <div style={s.modalBackdrop}>
          <div style={s.modalCard}>
            <h3 style={s.modalTitle}>Reject Booking Request</h3>
            <p style={s.modalSub}>
              {rejectingBooking.resourceName} on {rejectingBooking.bookingDate} from {rejectingBooking.startTime} to {rejectingBooking.endTime}
            </p>
            <label style={s.modalLabel}>Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this request was rejected"
              style={s.textarea}
            />
            <div style={s.modalActions}>
              <button onClick={closeRejectModal} style={s.secondaryBtn}>Close</button>
              <button onClick={handleReject} disabled={!rejectReason.trim()} style={s.rejectBtn}>Submit Rejection</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, tone }) {
  const toneMap = {
    blue:  { accent: '#4f6fff', bg: '#eef2ff' },
    amber: { accent: '#d97706', bg: '#fff7ed' },
    green: { accent: '#16a34a', bg: '#f0fdf4' },
    slate: { accent: '#475569', bg: '#f8fafc' },
  };
  const colors = toneMap[tone] || toneMap.blue;
  return (
    <div style={{ ...s.statCard, background: colors.bg }}>
      <div style={{ ...s.statLine, background: colors.accent }} />
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

function MetaBlock({ label, value }) {
  return (
    <div style={s.metaBlock}>
      <div style={s.metaLabel}>{label}</div>
      <div style={s.metaValue}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    PENDING:   { bg: '#fef3c7', color: '#92400e' },
    APPROVED:  { bg: '#dcfce7', color: '#166534' },
    REJECTED:  { bg: '#fee2e2', color: '#991b1b' },
    CANCELLED: { bg: '#e2e8f0', color: '#334155' },
  };
  return (
    <span style={{ ...s.badge, background: map[status]?.bg ?? '#f1f5f9', color: map[status]?.color ?? '#475569' }}>
      {status}
    </span>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = {
  hero:         { background: 'linear-gradient(135deg,#4f6fff,#00e5c3)', borderRadius: 18, padding: '26px 28px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  heroMeta:     { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' },
  heroPill:     { background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.22)', color: '#fff', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 700 },
  eyebrow:      { fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.78)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  title:        { color: '#fff', fontSize: 28, fontWeight: 800, margin: '8px 0' },
  sub:          { color: 'rgba(255,255,255,0.88)', margin: 0, maxWidth: 720 },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 },
  statCard:     { position: 'relative', borderRadius: 16, border: '1px solid #e2e8f0', padding: '18px 16px', overflow: 'hidden' },
  statLine:     { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  statValue:    { color: '#0f172a', fontSize: 28, fontWeight: 800 },
  statLabel:    { color: '#64748b', fontSize: 13, marginTop: 6 },
  toolbar:      { display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 },
  filterRow:    { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip:         { border: '1px solid #cbd5e1', background: '#fff', color: '#475569', borderRadius: 999, padding: '9px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  chipActive:   { background: '#0f172a', color: '#fff', borderColor: '#0f172a' },
  input:        { minWidth: 200, padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13 },
  searchBtn:    { background: '#4f6fff', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  secondaryBtn: { background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  panel:        { background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: 18, marginBottom: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  sectionHead:  { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap' },
  sectionTitle: { color: '#0f172a', fontSize: 20, fontWeight: 800, margin: 0 },
  sectionSub:   { color: '#64748b', margin: '6px 0 0 0', fontSize: 14 },
  queueCount:   { background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 700 },
  pendingGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 },
  pendingCard:  { border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, background: 'linear-gradient(180deg,#ffffff,#f8fafc)' },
  pendingTop:   { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 },
  cardTitle:    { color: '#0f172a', fontWeight: 800, fontSize: 17 },
  cardSub:      { color: '#64748b', fontSize: 13, marginTop: 5 },
  pendingMeta:  { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 14 },
  metaBlock:    { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 12px' },
  metaLabel:    { color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 },
  metaValue:    { color: '#0f172a', fontWeight: 700, fontSize: 13, wordBreak: 'break-word' },
  reasonPanel:  { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 14px', marginBottom: 14 },
  reasonLabel:  { color: '#94a3b8', fontSize: 11, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 },
  reasonValue:  { color: '#334155', fontSize: 14, lineHeight: 1.5 },
  tableWrap:    { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 18 },
  loading:      { padding: 24, color: '#64748b', textAlign: 'center' },
  emptyState:   { padding: 24, borderRadius: 14, background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#64748b', textAlign: 'center' },
  th:           { textAlign: 'left', padding: '14px 16px', background: '#f8fafc', color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 },
  td:           { padding: '14px 16px', verticalAlign: 'top' },
  primaryText:  { color: '#0f172a', fontWeight: 700, marginBottom: 4 },
  secondaryText:{ color: '#64748b', fontSize: 13, lineHeight: 1.5 },
  reviewNote:   { color: '#64748b', fontSize: 12, marginTop: 8, lineHeight: 1.5 },
  actions:      { display: 'flex', gap: 8, flexWrap: 'wrap' },
  approveBtn:   { background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  rejectBtn:    { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  cancelBtn:    { background: '#475569', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 },
  badge:        { display: 'inline-block', padding: '6px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800 },
  modalBackdrop:{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 200 },
  modalCard:    { width: '100%', maxWidth: 520, background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', padding: 22, boxShadow: '0 24px 60px rgba(0,0,0,0.18)' },
  modalTitle:   { margin: 0, color: '#0f172a', fontSize: 22, fontWeight: 800 },
  modalSub:     { margin: '8px 0 16px 0', color: '#64748b', lineHeight: 1.5 },
  modalLabel:   { display: 'block', color: '#334155', fontWeight: 700, fontSize: 13, marginBottom: 8 },
  textarea:     { minHeight: 120, resize: 'vertical', width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', boxSizing: 'border-box', fontSize: 14 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16, flexWrap: 'wrap' },
};