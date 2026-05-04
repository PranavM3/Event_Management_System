import { useEffect, useState } from 'react';
import { getMyFeedbacks, deleteFeedback } from '../api/feedbacks';
import StarRating from '../components/StarRating';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { MessageSquare, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function MyFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchFeedbacks = () => {
    getMyFeedbacks()
      .then((r) => setFeedbacks(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const handleDelete = async () => {
    try {
      await deleteFeedback(deleteModal);
      toast.success('Feedback deleted');
      setDeleteModal(null);
      fetchFeedbacks();
    } catch {
      toast.error('Failed to delete feedback');
    }
  };

  return (
    <motion.div className="page-container" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{duration: 0.4}}>
      <div className="page-hero">
        <div>
          <h1 className="page-title">My Feedbacks</h1>
          <p className="page-subtitle">{feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} given</p>
        </div>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : feedbacks.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={64} />
          <h3>No feedbacks yet</h3>
          <p>Attend events and share your experience!</p>
        </div>
      ) : (
        <div className="feedback-list standalone">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="feedback-item standalone">
              <div className="feedback-top">
                <div>
                  <h3 className="fb-event-title">{fb.eventTitle}</h3>
                  <span className="fb-date">{fb.createdAt ? format(new Date(fb.createdAt), 'MMM d, yyyy') : ''}</span>
                </div>
                <StarRating value={fb.rating} readOnly size={18} />
              </div>
              <p className="fb-comment">{fb.comment}</p>
              <div className="fb-actions">
                <Link to={`/events/${fb.eventId}`} className="btn btn-ghost btn-sm">
                  <ExternalLink size={14} /> View Event
                </Link>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteModal(fb.id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteModal}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(null)}
        danger
      />
    </motion.div>
  );
}
