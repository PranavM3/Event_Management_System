import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitFeedback } from '../api/feedbacks';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';
import { Send, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FeedbackPage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) { toast.error('Please select a rating'); return; }
    if (!form.comment.trim()) { toast.error('Please add a comment'); return; }
    if (form.comment.trim().length < 10) { toast.error('Comment must be at least 10 characters'); return; }

    setLoading(true);
    try {
      await submitFeedback({ eventId: Number(eventId), rating: form.rating, comment: form.comment });
      toast.success('Feedback submitted! Thank you.');
      navigate(`/events/${eventId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <motion.div className="page-container narrow" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{duration: 0.4}}>
      <Link to={`/events/${eventId}`} className="back-link"><ChevronLeft size={18} /> Back to Event</Link>

      <div className="form-card">
        <div className="feedback-form-header">
          <h1 className="page-title">Leave Feedback</h1>
          <p className="page-subtitle">Share your experience to help others</p>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group center">
            <label className="form-label">Your Rating *</label>
            <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} size={36} />
            {form.rating > 0 && (
              <span className="rating-label">{ratingLabels[form.rating]}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Your Comment *</label>
            <textarea
              className="form-input form-textarea"
              rows={5}
              placeholder="Tell others about your experience at this event..."
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              maxLength={500}
              id="feedback-comment"
            />
            <div className="char-count">{form.comment.length}/500 characters</div>
          </div>

          {/* Comment length validation bar */}
          <div className="validation-bar">
            <div
              className="validation-fill"
              style={{ width: `${Math.min((form.comment.length / 10) * 100, 100)}%`, background: form.comment.length >= 10 ? 'var(--color-success)' : 'var(--color-warning)' }}
            />
          </div>

          <div className="form-actions">
            <Link to={`/events/${eventId}`} className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-feedback-btn">
              {loading ? <span className="btn-spinner" /> : <><Send size={18} /> Submit Feedback</>}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
