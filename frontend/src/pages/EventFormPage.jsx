import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createEvent, getEventById, updateEvent } from '../api/events';
import toast from 'react-hot-toast';
import { Save, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const defaultForm = {
  title: '', description: '', location: '',
  startDateTime: '', endDateTime: '', maxParticipants: 30, category: '',
};

export default function EventFormPage() {
  const { id } = useParams(); // if id exists → edit mode
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      getEventById(id)
        .then((r) => {
          const ev = r.data;
          setForm({
            title: ev.title || '',
            description: ev.description || '',
            location: ev.location || '',
            startDateTime: ev.startDateTime?.slice(0, 16) || '',
            endDateTime: ev.endDateTime?.slice(0, 16) || '',
            maxParticipants: ev.maxParticipants || 30,
            category: ev.category || '',
          });
        })
        .catch(() => { toast.error('Event not found'); navigate('/events'); })
        .finally(() => setFetching(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    console.log('TOKEN CHECK:', token);
    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (!form.title || !form.startDateTime || !form.endDateTime || !form.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (new Date(form.endDateTime) <= new Date(form.startDateTime)) {
      toast.error('End time must be after start time');
      return;
    }
    setLoading(true);
    
    // Explicit Payload exactly as requested
    // Use the raw datetime-local value and append seconds so backend LocalDateTime parses it reliably
    const toLocalDateTimeString = (dt) => {
      if (!dt) return null;
      // dt from <input type="datetime-local"> is 'YYYY-MM-DDTHH:mm'
      return dt.length === 16 ? `${dt}:00` : dt;
    };

    const payload = {
      title: form.title,
      description: form.description,
      startDateTime: toLocalDateTimeString(form.startDateTime),
      endDateTime: toLocalDateTimeString(form.endDateTime),
      location: form.location,
      maxParticipants: Number(form.maxParticipants),
    };

    console.log('REQUEST URL:', isEdit ? `/events/${id}` : '/events');
    console.log('PAYLOAD:', payload);
    console.log('TOKEN:', token);

    try {
      if (isEdit) {
        await updateEvent(id, payload);
        toast.success('Event updated successfully!');
        navigate(`/events/${id}`);
      } else {
        const res = await createEvent(payload);
        toast.success('Event created successfully!');
        navigate(`/events/${res.data.id}`);
      }
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
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="page-container"><div className="page-loading"><div className="spinner" /></div></div>;
  }

  return (
    <motion.div className="page-container narrow" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{duration: 0.4}}>
      <Link to={isEdit ? `/events/${id}` : '/events'} className="back-link">
        <ChevronLeft size={18} /> Back
      </Link>

      <div className="form-page-header">
        <h1 className="page-title">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
        <p className="page-subtitle">{isEdit ? 'Update your event details' : 'Fill in the details to create a new event'}</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input name="title" type="text" className="form-input" placeholder="e.g. Spring Tech Conference"
              value={form.title} onChange={handleChange} id="event-title" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-input form-textarea" rows={4}
              placeholder="Describe your event..." value={form.description} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date & Time *</label>
              <input name="startDateTime" type="datetime-local" className="form-input"
                value={form.startDateTime} onChange={handleChange} id="start-datetime" />
            </div>
            <div className="form-group">
              <label className="form-label">End Date & Time *</label>
              <input name="endDateTime" type="datetime-local" className="form-input"
                value={form.endDateTime} onChange={handleChange} id="end-datetime" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input name="location" type="text" className="form-input" placeholder="Room / Venue / Online"
                value={form.location} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Max Participants</label>
              <input name="maxParticipants" type="number" min="1" className="form-input"
                value={form.maxParticipants} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" className="form-input" value={form.category} onChange={handleChange}>
              <option value="">Select category (optional)</option>
              <option value="Technology">Technology</option>
              <option value="Education">Education</option>
              <option value="Business">Business</option>
              <option value="Arts">Arts</option>
              <option value="Sports">Sports</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-actions">
            <Link to={isEdit ? `/events/${id}` : '/events'} className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading} id="save-event-btn">
              {loading ? <span className="btn-spinner" /> : <><Save size={18} /> {isEdit ? 'Update Event' : 'Create Event'}</>}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
