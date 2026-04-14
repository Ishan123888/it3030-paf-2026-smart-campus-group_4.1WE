import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  addIncidentComment,
  assignIncident,
  deleteIncidentComment,
  getIncidentAssignees,
  getIncidents,
  updateIncidentComment,
  updateIncidentStatus,
} from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import {
  IconAlertTriangle, IconActivity, IconUsers, IconSearch, IconFilter,
  IconEdit, IconTrash,
} from "../../components/common/Icons";

const STATUS_COLORS = {
  OPEN:        { text: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  IN_PROGRESS: { text: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  RESOLVED:    { text: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
  CLOSED:      { text: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
  REJECTED:    { text: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

const PRIORITY_COLORS = {
  LOW:      { text: "#059669", bg: "#f0fdf4" },
  MEDIUM:   { text: "#d97706", bg: "#fffbeb" },
  HIGH:     { text: "#dc2626", bg: "#fef2f2" },
  CRITICAL: { text: "#7c3aed", bg: "#f5f3ff" },
};

export default function AdminIncidentsPage() {
  const { user, isAdmin, isStaff } = useAuth();
  const canAssign = isAdmin() || isStaff();

  const [tickets, setTickets]           = useState([]);
  const [selectedId, setSelectedId]     = useState(null);
  const [assignees, setAssignees]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [flash, setFlashMsg]            = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editDraft, setEditDraft]       = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm]     = useState("");

  useEffect(() => {
    if (!user) return;
    loadTickets();
    if (canAssign) loadAssignees();
  }, [user]); // eslint-disable-line

  const setFlash = (msg) => { setFlashMsg(msg); setTimeout(() => setFlashMsg(""), 3200); };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await getIncidents();
      setTickets(res.data || []);
      if ((res.data || []).length > 0) setSelectedId(res.data[0].id);
    } catch { setFlash("Failed to load incidents"); }
    finally { setLoading(false); }
  };

  const loadAssignees = async () => {
    try { const res = await getIncidentAssignees(); setAssignees(res.data || []); }
    catch (err) { console.error(err); }
  };

  const filteredTickets = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return tickets.filter(t => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (!q) return true;
      return [t.ticketNumber, t.location, t.createdByName, t.createdByEmail, t.category, t.priority, t.description]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [tickets, statusFilter, searchTerm]);

  const selectedTicket = useMemo(() => tickets.find(t => t.id === selectedId) || null, [tickets, selectedId]);

  const ticketStats = useMemo(() => {
    const base = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0, REJECTED: 0 };
    tickets.forEach(t => { if (base[t.status] !== undefined) base[t.status]++; });
    return base;
  }, [tickets]);

  const upsertTicket = (ticket) => {
    setTickets(prev => {
      const idx = prev.findIndex(t => t.id === ticket.id);
      return idx === -1 ? [ticket, ...prev] : prev.map(t => t.id === ticket.id ? ticket : t);
    });
  };

  const onAssign = async (ticketId, assigneeEmail) => {
    if (!assigneeEmail) return;
    setSaving(true);
    try { const res = await assignIncident(ticketId, assigneeEmail); upsertTicket(res.data); setFlash("Ticket assigned"); }
    catch (err) { setFlash(err.response?.data?.message || "Failed to assign"); }
    finally { setSaving(false); }
  };

  const onStatusChange = async (ticketId, status) => {
    const payload = { status };
    if (status === "RESOLVED") {
      const notes = window.prompt("Add resolution notes:");
      if (!notes) return;
      payload.resolutionNotes = notes;
    }
    if (status === "REJECTED") {
      const reason = window.prompt("Provide rejection reason:");
      if (!reason) return;
      payload.rejectionReason = reason;
    }
    setSaving(true);
    try { const res = await updateIncidentStatus(ticketId, payload); upsertTicket(res.data); setFlash(`Status → ${status}`); }
    catch (err) { setFlash(err.response?.data?.message || "Failed to update status"); }
    finally { setSaving(false); }
  };

  const submitComment = async () => {
    if (!selectedTicket || !commentDraft.trim()) return;
    setSaving(true);
    try { const res = await addIncidentComment(selectedTicket.id, commentDraft.trim()); upsertTicket(res.data); setCommentDraft(""); }
    catch (err) { setFlash(err.response?.data?.message || "Failed to add comment"); }
    finally { setSaving(false); }
  };

  const saveEditedComment = async () => {
    if (!selectedTicket || !editingComment || !editDraft.trim()) return;
    setSaving(true);
    try { const res = await updateIncidentComment(selectedTicket.id, editingComment, editDraft.trim()); upsertTicket(res.data); setEditingComment(null); setEditDraft(""); }
    catch (err) { setFlash(err.response?.data?.message || "Failed to update comment"); }
    finally { setSaving(false); }
  };

  const removeComment = async (commentId) => {
    if (!selectedTicket) return;
    setSaving(true);
    try { await deleteIncidentComment(selectedTicket.id, commentId); await loadTickets(); }
    catch (err) { setFlash(err.response?.data?.message || "Failed to delete comment"); }
    finally { setSaving(false); }
  };

  const canTransition = (ticket, target) => {
    const mine = ticket.createdByEmail === user?.email;
    const assigned = ticket.assignedToEmail === user?.email;
    const privileged = isAdmin() || isStaff();
    if (target === "REJECTED")    return isAdmin();
    if (target === "IN_PROGRESS") return privileged || assigned;
    if (target === "RESOLVED")    return privileged || assigned;
    if (target === "CLOSED")      return privileged || mine;
    return false;
  };

  const canEditComment = (comment) => comment.createdByEmail === user?.email || isAdmin();

  return (
    <AdminLayout title="Incident Management">
      {/* Flash */}
      {flash && (
        <div style={{ position:"fixed", top:72, right:24, zIndex:999, padding:"12px 20px", borderRadius:10, fontWeight:600, fontSize:14, background:"#eff6ff", border:"1px solid #bfdbfe", color:"#2563eb", boxShadow:"0 4px 20px rgba(0,0,0,0.1)" }}>
          {flash}
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:12, marginBottom:24 }}>
        {Object.entries(ticketStats).map(([status, count]) => {
          const c = STATUS_COLORS[status] || STATUS_COLORS.CLOSED;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? "ALL" : status)}
              style={{ background: statusFilter === status ? c.bg : "#fff", border:`2px solid ${statusFilter === status ? c.border : "#e2e8f0"}`, borderRadius:12, padding:"14px 16px", cursor:"pointer", textAlign:"left", transition:"all 0.15s", fontFamily:"inherit" }}
            >
              <div style={{ fontSize:26, fontWeight:800, color:c.text, lineHeight:1 }}>{count}</div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:4, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>{status.replace("_"," ")}</div>
            </button>
          );
        })}
        <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:"#eff6ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IconAlertTriangle size={20} style={{ color:"#2563eb" }}/>
          </div>
          <div>
            <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", lineHeight:1 }}>{tickets.length}</div>
            <div style={{ fontSize:11, color:"#64748b", marginTop:4, fontWeight:700 }}>TOTAL</div>
          </div>
        </div>
      </div>

      {/* Main 3-column grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr 1.6fr", gap:16, alignItems:"start" }}>

        {/* ── Left: Admin Controls ── */}
        <div style={card}>
          <div style={cardHeader}>
            <IconActivity size={16} style={{ color:"#4f6fff" }}/>
            <h3 style={cardTitle}>Controls</h3>
          </div>

          <button onClick={loadTickets} disabled={loading} style={primaryBtn}>
            {loading ? "Refreshing..." : "↻ Refresh Tickets"}
          </button>

          <div style={{ marginTop:16 }}>
            <div style={sectionLabel}>Assign Technician</div>
            {canAssign && selectedTicket ? (
              <select
                onChange={e => onAssign(selectedTicket.id, e.target.value)}
                defaultValue=""
                disabled={saving}
                style={selectStyle}
              >
                <option value="" disabled>Select assignee...</option>
                {assignees.map(p => (
                  <option key={p.email} value={p.email}>{p.name} ({p.email})</option>
                ))}
              </select>
            ) : (
              <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>Select a ticket first</p>
            )}
          </div>

          {selectedTicket && (
            <div style={{ marginTop:16 }}>
              <div style={sectionLabel}>Update Status</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {selectedTicket.status === "OPEN" && canTransition(selectedTicket, "IN_PROGRESS") && (
                  <StatusBtn onClick={() => onStatusChange(selectedTicket.id, "IN_PROGRESS")} color="#d97706" bg="#fffbeb" border="#fde68a" label="▶ Start Progress" disabled={saving}/>
                )}
                {selectedTicket.status === "IN_PROGRESS" && canTransition(selectedTicket, "RESOLVED") && (
                  <StatusBtn onClick={() => onStatusChange(selectedTicket.id, "RESOLVED")} color="#059669" bg="#f0fdf4" border="#bbf7d0" label="✓ Mark Resolved" disabled={saving}/>
                )}
                {selectedTicket.status === "RESOLVED" && canTransition(selectedTicket, "CLOSED") && (
                  <StatusBtn onClick={() => onStatusChange(selectedTicket.id, "CLOSED")} color="#475569" bg="#f8fafc" border="#e2e8f0" label="✕ Close Ticket" disabled={saving}/>
                )}
                {(selectedTicket.status === "OPEN" || selectedTicket.status === "IN_PROGRESS") && canTransition(selectedTicket, "REJECTED") && (
                  <StatusBtn onClick={() => onStatusChange(selectedTicket.id, "REJECTED")} color="#dc2626" bg="#fef2f2" border="#fecaca" label="✗ Reject" disabled={saving}/>
                )}
              </div>
            </div>
          )}

          {/* Audit Trail */}
          {selectedTicket && (selectedTicket.auditLogs || []).length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={sectionLabel}>Audit Trail</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:200, overflowY:"auto" }}>
                {selectedTicket.auditLogs.slice().reverse().slice(0, 8).map(log => (
                  <div key={log.id} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#0f172a" }}>{log.action}</div>
                    <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{log.details}</div>
                    <div style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}>{log.actorName} · {new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Middle: Ticket List ── */}
        <div style={card}>
          <div style={cardHeader}>
            <IconFilter size={16} style={{ color:"#4f6fff" }}/>
            <h3 style={cardTitle}>Tickets ({filteredTickets.length})</h3>
          </div>

          {/* Search */}
          <div style={{ position:"relative", marginBottom:10 }}>
            <IconSearch size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94a3b8", pointerEvents:"none" }}/>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search tickets..."
              style={{ ...inputStyle, paddingLeft:30 }}
            />
          </div>

          {/* Status filter */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...selectStyle, marginBottom:12 }}>
            {["ALL","OPEN","IN_PROGRESS","RESOLVED","CLOSED","REJECTED"].map(s => (
              <option key={s} value={s}>{s.replace("_"," ")}</option>
            ))}
          </select>

          {loading ? (
            <div style={{ textAlign:"center", padding:32, color:"#94a3b8" }}>
              <div style={{ width:28, height:28, border:"3px solid #e2e8f0", borderTop:"3px solid #4f6fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 8px" }}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Loading...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div style={{ textAlign:"center", padding:32, color:"#94a3b8" }}>
              <IconAlertTriangle size={28} style={{ marginBottom:8, opacity:0.4 }}/>
              <div style={{ fontSize:13 }}>No tickets found</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:"calc(100vh - 340px)", overflowY:"auto" }}>
              {filteredTickets.map(ticket => {
                const sc = STATUS_COLORS[ticket.status] || STATUS_COLORS.CLOSED;
                const pc = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.MEDIUM;
                const isSelected = ticket.id === selectedId;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedId(ticket.id)}
                    style={{ background: isSelected?"#f0f7ff":"#fff", border:`2px solid ${isSelected?"#4f6fff":"#e2e8f0"}`, borderRadius:10, padding:"12px 14px", cursor:"pointer", textAlign:"left", transition:"all 0.15s", fontFamily:"inherit" }}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{ticket.ticketNumber}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20, background:sc.bg, color:sc.text, border:`1px solid ${sc.border}`, whiteSpace:"nowrap" }}>
                        {ticket.status.replace("_"," ")}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:6, marginBottom:4 }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, background:pc.bg, color:pc.text }}>{ticket.priority}</span>
                      <span style={{ fontSize:11, color:"#64748b" }}>{ticket.category}</span>
                    </div>
                    <div style={{ fontSize:11, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ticket.location}</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{ticket.createdByName}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Ticket Detail ── */}
        <div style={card}>
          {!selectedTicket ? (
            <div style={{ textAlign:"center", padding:48, color:"#94a3b8" }}>
              <IconAlertTriangle size={36} style={{ marginBottom:12, opacity:0.3 }}/>
              <div style={{ fontSize:14 }}>Select a ticket to view details</div>
            </div>
          ) : (
            <>
              {/* Ticket Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, gap:8 }}>
                <div>
                  <div style={{ fontSize:18, fontWeight:800, color:"#0f172a" }}>{selectedTicket.ticketNumber}</div>
                  <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{selectedTicket.category} · {selectedTicket.priority}</div>
                </div>
                <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20, background:STATUS_COLORS[selectedTicket.status]?.bg, color:STATUS_COLORS[selectedTicket.status]?.text, border:`1px solid ${STATUS_COLORS[selectedTicket.status]?.border}`, whiteSpace:"nowrap", flexShrink:0 }}>
                  {selectedTicket.status.replace("_"," ")}
                </span>
              </div>

              {/* Description */}
              <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>Description</div>
                <p style={{ fontSize:13, color:"#0f172a", margin:0, lineHeight:1.6, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{selectedTicket.description}</p>
              </div>

              {/* Meta grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
                {[
                  { label:"Location",  value: selectedTicket.location },
                  { label:"Reporter",  value: selectedTicket.createdByName },
                  { label:"Email",     value: selectedTicket.createdByEmail },
                  { label:"Assignee",  value: selectedTicket.assignedToName || "Not assigned" },
                ].map(m => (
                  <div key={m.label} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 10px" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.05em" }}>{m.label}</div>
                    <div style={{ fontSize:12, color:"#0f172a", marginTop:2, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {selectedTicket.resolutionNotes && (
                <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"8px 12px", marginBottom:10, fontSize:12, color:"#059669" }}>
                  <strong>Resolution:</strong> {selectedTicket.resolutionNotes}
                </div>
              )}
              {selectedTicket.rejectionReason && (
                <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", marginBottom:10, fontSize:12, color:"#dc2626" }}>
                  <strong>Rejection:</strong> {selectedTicket.rejectionReason}
                </div>
              )}

              {/* Attachments */}
              {selectedTicket.attachments?.length > 0 && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))", gap:8, marginBottom:14 }}>
                  {selectedTicket.attachments.map(att => (
                    <a key={att.fileId || att.url} href={att.url} target="_blank" rel="noreferrer">
                      <img src={att.url} alt={att.fileName} style={{ width:"100%", aspectRatio:"1/1", objectFit:"cover", borderRadius:8, border:"1px solid #e2e8f0" }}/>
                    </a>
                  ))}
                </div>
              )}

              {/* Comments */}
              <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:14 }}>
                <div style={{ ...cardHeader, marginBottom:10 }}>
                  <IconUsers size={14} style={{ color:"#4f6fff" }}/>
                  <h4 style={{ ...cardTitle, fontSize:13 }}>Comments ({(selectedTicket.comments || []).length})</h4>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:200, overflowY:"auto", marginBottom:10 }}>
                  {(selectedTicket.comments || []).length === 0 ? (
                    <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>No comments yet</p>
                  ) : (
                    (selectedTicket.comments || []).map(comment => (
                      <div key={comment.id} style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"10px 12px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:12, fontWeight:700, color:"#0f172a" }}>{comment.createdByName}</span>
                          <span style={{ fontSize:10, color:"#94a3b8" }}>{new Date(comment.updatedAt || comment.createdAt).toLocaleString()}</span>
                        </div>
                        {editingComment === comment.id ? (
                          <>
                            <textarea value={editDraft} onChange={e => setEditDraft(e.target.value)} rows={2} style={{ ...inputStyle, marginBottom:6 }}/>
                            <div style={{ display:"flex", gap:6 }}>
                              <button onClick={saveEditedComment} style={smallBtn}>Save</button>
                              <button onClick={() => { setEditingComment(null); setEditDraft(""); }} style={{ ...smallBtn, background:"#f1f5f9", color:"#475569", border:"1px solid #e2e8f0" }}>Cancel</button>
                            </div>
                          </>
                        ) : (
                          <p style={{ fontSize:12, color:"#475569", margin:0, lineHeight:1.5, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{comment.content}</p>
                        )}
                        {canEditComment(comment) && editingComment !== comment.id && (
                          <div style={{ display:"flex", gap:6, marginTop:6 }}>
                            <button onClick={() => { setEditingComment(comment.id); setEditDraft(comment.content); }} style={{ ...smallBtn, display:"flex", alignItems:"center", gap:4 }}>
                              <IconEdit size={11}/> Edit
                            </button>
                            <button onClick={() => removeComment(comment.id)} style={{ ...smallBtn, background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", display:"flex", alignItems:"center", gap:4 }}>
                              <IconTrash size={11}/> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment */}
                <div style={{ display:"flex", gap:8 }}>
                  <textarea
                    rows={2}
                    value={commentDraft}
                    onChange={e => setCommentDraft(e.target.value)}
                    placeholder="Add a comment..."
                    style={{ ...inputStyle, flex:1, resize:"none" }}
                  />
                  <button onClick={submitComment} disabled={saving || !commentDraft.trim()} style={{ ...primaryBtn, alignSelf:"flex-end", padding:"10px 16px", whiteSpace:"nowrap" }}>
                    Add
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBtn({ onClick, color, bg, border, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding:"9px 14px", borderRadius:8, border:`1px solid ${border}`, background:bg, color, fontSize:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit", textAlign:"left", opacity:disabled?0.6:1, transition:"all 0.15s" }}>
      {label}
    </button>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const card = {
  background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:14,
  padding:"18px 16px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)",
};

const cardHeader = {
  display:"flex", alignItems:"center", gap:8, marginBottom:14,
};

const cardTitle = {
  fontSize:14, fontWeight:700, color:"#0f172a", margin:0,
};

const sectionLabel = {
  fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase",
  letterSpacing:"0.05em", marginBottom:6,
};

const inputStyle = {
  width:"100%", padding:"9px 12px", fontSize:13,
  border:"2px solid #e2e8f0", borderRadius:8, outline:"none",
  fontFamily:"inherit", color:"#0f172a", background:"#f8fafc",
  boxSizing:"border-box", transition:"border-color 0.15s",
};

const selectStyle = {
  ...inputStyle, cursor:"pointer",
};

const primaryBtn = {
  width:"100%", padding:"10px 16px", borderRadius:8, border:"none",
  background:"linear-gradient(135deg,#4f6fff,#00e5c3)", color:"#fff",
  fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
  boxShadow:"0 4px 12px rgba(79,111,255,0.2)",
};

const smallBtn = {
  padding:"5px 10px", borderRadius:6, border:"1px solid #bfdbfe",
  background:"#eff6ff", color:"#2563eb", fontSize:11, fontWeight:700,
  cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center",
};
