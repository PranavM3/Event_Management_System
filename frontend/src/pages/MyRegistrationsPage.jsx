import { useEffect, useState } from 'react';
import { getMyRegistrations, cancelRegistration } from '../api/registrations';
import ConfirmModal from '../components/ConfirmModal';
import SkeletonCard from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ClipboardList, X, ExternalLink, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);

  const fetchRegs = () => {
    getMyRegistrations()
      .then((r) => setRegistrations(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRegs(); }, []);

  const handleCancel = async () => {
    try {
      await cancelRegistration(cancelModal);
      toast.success('Registration cancelled');
      setCancelModal(null);
      fetchRegs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) {
    return <div className="page-container"><div className="events-grid">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div></div>;
  }

  return (
    <motion.div className="page-container" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{duration: 0.4}}>
      <div className="page-hero">
        <div>
          <h1 className="page-title">My Registrations</h1>
          <p className="page-subtitle">{registrations.length} registration{registrations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="empty-state">
          <ClipboardList size={64} />
          <h3>No registrations yet</h3>
          <p>Browse events and register to see them here.</p>
          <Link to="/events" className="btn btn-primary mt-4">Browse Events</Link>
        </div>
      ) : (
        <div className="reg-grid">
          {registrations.map((reg) => (
            <div key={reg.id} className={`reg-card status-border-${reg.status?.toLowerCase()}`}>
              <div className="reg-card-header">
                <span className={`status-badge status-${reg.status?.toLowerCase()}`}>{reg.status}</span>
                {reg.attended && <span className="attended-badge">✅ Attended</span>}
              </div>
              <h3 className="reg-event-title">{reg.eventTitle}</h3>
              <div className="reg-meta">
                <span><Calendar size={14} /> Registered: {reg.registrationDate ? format(new Date(reg.registrationDate), 'MMM d, yyyy') : '—'}</span>
                {reg.checkInTime && <span>✅ Checked in: {format(new Date(reg.checkInTime), 'MMM d, HH:mm')}</span>}
              </div>
              <div className="reg-actions">
                <Link to={`/events/${reg.eventId}`} className="btn btn-ghost btn-sm">
                  <ExternalLink size={14} /> View Event
                </Link>
                {(reg.status === 'CONFIRMED' || reg.status === 'WAITLISTED') && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setCancelModal(reg.id)}
                    id={`cancel-reg-${reg.id}`}
                  >
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelModal}
        title="Cancel Registration"
        message="Are you sure you want to cancel this registration?"
        onConfirm={handleCancel}
        onCancel={() => setCancelModal(null)}
        danger
      />
    </motion.div>
  );
}
