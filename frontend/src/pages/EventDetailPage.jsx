import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { getEventById, deleteEvent, updateEventStatus } from '../api/events';
import { registerForEvent, getEventRegistrations } from '../api/registrations';
import { getEventFeedbacks, getAverageRating } from '../api/feedbacks';
import { getUserById } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Calendar, MapPin, Users, Clock, Edit, Trash2,
  UserPlus, MessageSquare, ChevronLeft, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export default function EventDetailPage() {
  const { id } = useParams();
  const { user, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [orgModal, setOrgModal] = useState(false);
  const [organizer, setOrganizer] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [evRes, fbRes, avgRes] = await Promise.allSettled([
          getEventById(id),
          getEventFeedbacks(id),
          getAverageRating(id),
        ]);
        if (evRes.status === 'fulfilled') setEvent(evRes.value.data);
        if (fbRes.status === 'fulfilled') setFeedbacks(fbRes.value.data || []);
        if (avgRes.status === 'fulfilled') setAvgRating(avgRes.value.data);

        if (isOrganizer() || isAdmin()) {
          try {
            const regRes = await getEventRegistrations(id);
            setRegistrations(regRes.data || []);
          } catch {
            // Not the event owner or insufficient permissions — silently ignore
          }
        }
      } catch {
        toast.error('Event not found');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    if (orgModal && event?.organizerId) {
      getUserById(event.organizerId)
        .then((r) => setOrganizer(r.data))
        .catch((e) => console.log('User fetch error', e));
    }
  }, [orgModal, event?.organizerId]);

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:8080/api/registrations/event/${id}`;
    
    console.log('TOKEN CHECK:', token);
    if (!token) {
      window.location.href = '/login';
      return;
    }

    console.log('REQUEST URL:', url);
    console.log('PAYLOAD:', { eventId: id });
    console.log('TOKEN:', token);

    setRegistering(true);
    try {
      await registerForEvent(Number(id));
      toast.success('Successfully registered!');
      const res = await getEventById(id);
      setEvent(res.data);
    } catch (err) {
      console.log('ERROR:', err.response);
      if (!err.response) {
        toast.error('Server not running');
      } else if (err.response.status === 401) {
        toast.error('Login required');
      } else if (err.response.status === 403) {
        toast.error('Already registered or not allowed');
      } else if (err.response.status === 400) {
        toast.error('Invalid request data');
      } else {
        toast.error('Operation failed');
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(id);
      toast.success('Event deleted');
      navigate('/events');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const handleStatusChange = async (status) => {
    try {
      await updateEventStatus(id, status);
      toast.success(`Status updated to ${status}`);
      const res = await getEventById(id);
      setEvent(res.data);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="detail-skeleton">
          <div className="skeleton-line w60 big" />
          <div className="skeleton-line w40" />
          <div className="skeleton-line w80" />
        </div>
      </div>
    );
  }

  if (!event) return null;

  const seatsLeft = event.maxParticipants - (event.currentParticipants || 0);
  const isFull = seatsLeft <= 0;
  const isOwnEvent = event.organizerId === user?.id;
  const canManage = isAdmin() || isOwnEvent;

  return (
    <motion.div 
      className="page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Link to="/events" className="back-link"><ChevronLeft size={18} /> Back to Events</Link>

      <div className="detail-layout">
        {/* Main content */}
        <div className="detail-main">
          <div className="detail-header">
            <div className="detail-badges">
              {(() => {
                let badgeClass = 'status-upcoming';
                let badgeText = 'UPCOMING';
                
                if (event.status === 'CANCELLED') {
                  badgeClass = 'status-cancelled';
                  badgeText = 'CANCELLED';
                } else if (isFull) {
                  badgeClass = 'seats-badge full';
                  badgeText = 'FULL';
                }

                return (
                  <span className={`status-badge ${badgeClass}`}>
                    {badgeText}
                  </span>
                );
              })()}
              <span className="event-seats">
                {Math.max(0, seatsLeft)} seats left
              </span>
            </div>
            <h1 className="detail-title">{event.title}</h1>
            <p className="detail-desc">{event.description}</p>
            
            {/* Capacity Progress Bar */}
            <div className="capacity-container">
              <div className="capacity-header">
                <span className="capacity-label">Capacity</span>
                <span className="capacity-text">{event.currentParticipants} / {event.maxParticipants} Registered</span>
              </div>
              <div className="progress-bar-bg">
                <motion.div 
                  className={`progress-bar-fill ${isFull ? 'full' : ''}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          <div className="detail-meta-grid">
            <div className="meta-item"><Calendar size={20} /><div><label>Start</label><span>{format(new Date(event.startDateTime), 'PPpp')}</span></div></div>
            <div className="meta-item"><Clock size={20} /><div><label>End</label><span>{format(new Date(event.endDateTime), 'PPpp')}</span></div></div>
            <div className="meta-item"><MapPin size={20} /><div><label>Location</label><span>{event.location}</span></div></div>
            <div className="meta-item"><Users size={20} /><div><label>Capacity</label><span>{event.currentParticipants}/{event.maxParticipants}</span></div></div>
          </div>

          {/* Average Rating */}
          <div className="avg-rating-section">
            <h3>Average Rating</h3>
            <div className="avg-rating-display">
              <StarRating value={Math.round(event?.averageRating ?? 0)} readOnly size={22} />
              <span className="avg-number">{(event?.averageRating ?? 0).toFixed(1)} / 5</span>
            </div>
          </div>

          {/* Feedbacks */}
          {feedbacks.length > 0 && (
            <div className="feedbacks-section">
              <h3><MessageSquare size={20} /> Reviews ({feedbacks.length})</h3>
              <div className="feedback-list">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="feedback-item">
                    <div className="feedback-top">
                      <div className="feedback-user">
                        <div className="fb-avatar">{fb.userName?.[0]}</div>
                        <div>
                          <div className="fb-name">{fb.userName}</div>
                          <div className="fb-date">{format(new Date(fb.createdAt), 'MMM d, yyyy')}</div>
                        </div>
                      </div>
                      <StarRating value={fb.rating} readOnly size={16} />
                    </div>
                    <p className="fb-comment">{fb.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registrations table (Organizer/Admin) */}
          {canManage && registrations.length > 0 && (
            <div className="registrations-section">
              <h3><Users size={20} /> Registrations ({registrations.length})</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Status</th><th>Attended</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {registrations.map((r) => (
                      <tr key={r.id}>
                        <td>{r.userName}</td>
                        <td><span className={`status-badge status-${r.status?.toLowerCase()}`}>{r.status}</span></td>
                        <td>{r.attended ? '✅' : '—'}</td>
                        <td>{r.registrationDate ? format(new Date(r.registrationDate), 'MMM d') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          <div className="sidebar-card">
            <div className="organizer-info clickable" onClick={() => setOrgModal(true)}>
              <div className="org-avatar">{event.organizerName?.[0]}</div>
              <div>
                <div className="org-label">Organizer (Click for info)</div>
                <div className="org-name">{event.organizerName}</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="sidebar-actions">
            {!canManage && event.status === 'UPCOMING' && (
              <button
                className="btn btn-primary btn-full"
                onClick={handleRegister}
                disabled={registering || isFull}
                id="register-btn"
              >
                {registering ? <span className="btn-spinner" /> : <><UserPlus size={18} /> {isFull ? 'Event Full' : 'Register Now'}</>}
              </button>
            )}

            {event.status === 'COMPLETED' && !canManage && (
              <Link to={`/events/${id}/feedback`} className="btn btn-secondary btn-full">
                <Star size={18} /> Leave Feedback
              </Link>
            )}

            {canManage && (
              <>
                <Link to={`/events/${id}/edit`} className="btn btn-secondary btn-full">
                  <Edit size={18} /> Edit Event
                </Link>

                <div className="status-controls">
                  <label className="form-label">Change Status</label>
                  <select
                    className="form-input"
                    value={event.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    id="status-select"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <button
                  className="btn btn-danger btn-full"
                  onClick={() => setDeleteModal(true)}
                  id="delete-event-btn"
                >
                  <Trash2 size={18} /> Delete Event
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Event"
        message={`Are you sure you want to delete "${event.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
        danger
      />

      <AnimatePresence>
        {orgModal && (
          <div className="glass-modal-overlay" onClick={() => setOrgModal(false)}>
            <motion.div 
              className="glass-modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3>Organizer Details</h3>
                <button className="close-btn" onClick={() => setOrgModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="modal-info-item">
                  <label>Full Name</label>
                  <p>{organizer?.fullName || event.organizerName || 'Not available'}</p>
                </div>
                <div className="modal-info-item">
                  <label>Email Address</label>
                  <p>{organizer?.email || 'Not available'}</p>
                </div>
                <div className="modal-info-item">
                  <label>Phone Number</label>
                  <p>{organizer?.phone || 'Not available'}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary btn-full" onClick={() => setOrgModal(false)}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
