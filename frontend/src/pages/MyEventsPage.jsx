import { useEffect, useState } from 'react';
import { getMyEvents } from '../api/events';
import { getEventRegistrations, markAttendance } from '../api/registrations';
import SkeletonCard from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Settings, Users, UserCheck, Edit, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [registrations, setRegistrations] = useState({});
  const [loadingRegs, setLoadingRegs] = useState(false);

  useEffect(() => {
    getMyEvents()
      .then((r) => setEvents(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const toggleEvent = async (eventId) => {
    if (expanded === eventId) { setExpanded(null); return; }
    setExpanded(eventId);
    if (registrations[eventId]) return;
    setLoadingRegs(true);
    try {
      const res = await getEventRegistrations(eventId);
      setRegistrations((prev) => ({ ...prev, [eventId]: res.data || [] }));
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleMarkAttendance = async (regId, eventId) => {
    try {
      await markAttendance(regId);
      toast.success('Attendance marked!');
      const res = await getEventRegistrations(eventId);
      setRegistrations((prev) => ({ ...prev, [eventId]: res.data || [] }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  if (loading) {
    return <div className="page-container"><div className="events-grid">{[1,2,3].map(i=><SkeletonCard key={i}/>)}</div></div>;
  }

  return (
    <motion.div className="page-container" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{duration: 0.4}}>
      <div className="page-hero">
        <div>
          <h1 className="page-title">My Events</h1>
          <p className="page-subtitle">{events.length} event{events.length !== 1 ? 's' : ''} managed</p>
        </div>
        <Link to="/events/create" className="btn btn-primary"><Settings size={18} /> Create Event</Link>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No events created yet</h3>
          <Link to="/events/create" className="btn btn-primary mt-4">Create your first event</Link>
        </div>
      ) : (
        <div className="my-events-list">
          {events.map((event) => (
            <div key={event.id} className="my-event-item">
              <div className="my-event-header">
                <div className="my-event-info">
                  <div className="my-event-badges">
                    <span className={`status-badge status-${event.status?.toLowerCase()}`}>{event.status}</span>
                    <span className="seats-badge ok">{event.currentParticipants}/{event.maxParticipants} registered</span>
                  </div>
                  <h3 className="my-event-title">{event.title}</h3>
                  <div className="my-event-meta">
                    <span><Calendar size={14} /> {event.startDateTime ? format(new Date(event.startDateTime), 'MMM d, yyyy HH:mm') : 'TBD'}</span>
                    <span>📍 {event.location}</span>
                  </div>
                </div>
                <div className="my-event-actions">
                  <Link to={`/events/${event.id}/edit`} className="btn btn-ghost btn-sm"><Edit size={14} /> Edit</Link>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleEvent(event.id)}
                    id={`toggle-regs-${event.id}`}
                  >
                    <Users size={14} /> {expanded === event.id ? 'Hide' : 'Registrations'}
                  </button>
                </div>
              </div>

              {expanded === event.id && (
                <div className="regs-panel">
                  {loadingRegs ? (
                    <div className="panel-loading"><div className="spinner sm" /></div>
                  ) : (registrations[event.id] || []).length === 0 ? (
                    <p className="panel-empty">No registrations yet</p>
                  ) : (
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr><th>Name</th><th>Status</th><th>Attended</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                          {(registrations[event.id] || []).map((r) => (
                            <tr key={r.id}>
                              <td>{r.userName}</td>
                              <td><span className={`status-badge status-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                              <td>{r.attended ? '✅' : '—'}</td>
                              <td>
                                {!r.attended && r.status === 'REGISTERED' && (
                                  <button
                                    className="btn btn-primary btn-xs"
                                    onClick={() => handleMarkAttendance(r.id, event.id)}
                                    id={`attend-${r.id}`}
                                  >
                                    <UserCheck size={13} /> Mark Present
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
