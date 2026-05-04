import { useEffect, useState } from 'react';
import { getAllEvents, deleteEvent } from '../api/events';
import { getMyFeedbacks, deleteFeedback } from '../api/feedbacks';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Shield, Trash2, Calendar, MessageSquare } from 'lucide-react';

import { motion } from 'framer-motion';

export default function AdminPage() {
  const [events, setEvents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [tab, setTab] = useState('events');

  const fetchAll = async () => {
    const [evRes, fbRes] = await Promise.allSettled([getAllEvents(), getMyFeedbacks()]);
    if (evRes.status === 'fulfilled') setEvents(evRes.value.data || []);
    if (fbRes.status === 'fulfilled') setFeedbacks(fbRes.value.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDeleteEvent = async () => {
    try {
      await deleteEvent(deleteModal.id);
      toast.success('Event deleted');
      setDeleteModal(null);
      fetchAll();
    } catch { toast.error('Failed to delete event'); }
  };

  const handleDeleteFeedback = async () => {
    try {
      await deleteFeedback(deleteModal.id);
      toast.success('Feedback deleted');
      setDeleteModal(null);
      fetchAll();
    } catch { toast.error('Failed to delete feedback'); }
  };

  return (
    <motion.div className="page-container" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{duration: 0.4}}>
      <div className="page-hero">
        <div className="hero-icon-title">
          <Shield size={32} className="hero-icon" />
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Full system control</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="admin-stats">
        <div className="admin-stat"><Calendar size={20} /><span>{events.length} Total Events</span></div>
        <div className="admin-stat"><MessageSquare size={20} /><span>{feedbacks.length} Feedbacks</span></div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
          <Calendar size={16} /> Events
        </button>
        <button className={`tab-btn ${tab === 'feedbacks' ? 'active' : ''}`} onClick={() => setTab('feedbacks')}>
          <MessageSquare size={16} /> Feedbacks
        </button>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : tab === 'events' ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Title</th><th>Status</th><th>Organizer</th><th>Date</th><th>Capacity</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td className="font-medium">{ev.title}</td>
                  <td><span className={`status-badge status-${ev.status?.toLowerCase()}`}>{ev.status}</span></td>
                  <td>{ev.organizerName}</td>
                  <td>{ev.startDateTime ? format(new Date(ev.startDateTime), 'MMM d, yyyy') : '—'}</td>
                  <td>{ev.currentParticipants}/{ev.maxParticipants}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-xs"
                      onClick={() => setDeleteModal({ id: ev.id, type: 'event', title: ev.title })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Event</th><th>User</th><th>Rating</th><th>Comment</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {feedbacks.map((fb) => (
                <tr key={fb.id}>
                  <td>{fb.eventTitle}</td>
                  <td>{fb.userName}</td>
                  <td>{'⭐'.repeat(fb.rating)}</td>
                  <td className="comment-cell">{fb.comment?.slice(0, 60)}…</td>
                  <td>{fb.createdAt ? format(new Date(fb.createdAt), 'MMM d') : '—'}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-xs"
                      onClick={() => setDeleteModal({ id: fb.id, type: 'feedback' })}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteModal}
        title={`Delete ${deleteModal?.type === 'event' ? 'Event' : 'Feedback'}`}
        message={deleteModal?.type === 'event'
          ? `Delete "${deleteModal?.title}"? This cannot be undone.`
          : 'Delete this feedback? This cannot be undone.'}
        onConfirm={deleteModal?.type === 'event' ? handleDeleteEvent : handleDeleteFeedback}
        onCancel={() => setDeleteModal(null)}
        danger
      />
    </motion.div>
  );
}
