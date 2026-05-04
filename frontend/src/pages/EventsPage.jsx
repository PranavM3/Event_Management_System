import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllEvents } from '../api/events';
import { useAuth } from '../contexts/AuthContext';
import SkeletonCard from '../components/SkeletonCard';
import { format } from 'date-fns';
import { Search, Filter, PlusCircle, Calendar, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const STATUS_OPTIONS = ['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export default function EventsPage() {
  const { isOrganizer, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  useEffect(() => {
    getAllEvents()
      .then((r) => { setEvents(r.data || []); setFiltered(r.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const titleRef = useRef(null);

  useEffect(() => {
    if (!loading && titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [loading]);

  useEffect(() => {
    let result = [...events];
    if (statusFilter !== 'ALL') result = result.filter((e) => e.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.title?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
    setPage(1);
  }, [search, statusFilter, events]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const seatsLeft = (ev) => ev.maxParticipants - (ev.currentParticipants || 0);

  return (
    <motion.div 
      className="page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="page-hero">
        <div>
          <h1 className="page-title" ref={titleRef}>Events</h1>
          <p className="page-subtitle">{filtered.length} events available</p>
        </div>
        {(isOrganizer() || isAdmin()) && (
          <Link to="/events/create" className="btn btn-primary">
            <PlusCircle size={18} /> New Event
          </Link>
        )}
      </div>

      {/* Search + Filter */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="event-search"
          />
        </div>
        <div className="filter-group">
          <Filter size={16} />
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
              id={`filter-${s.toLowerCase()}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="events-grid">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : paginated.length === 0 ? (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No events found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <motion.div className="events-grid" variants={containerVariants} initial="hidden" animate="show">
          {paginated.map((event) => {
            const seats = seatsLeft(event);
            const isFull = seats <= 0;
            return (
              <motion.div key={event.id} variants={itemVariants}>
                <Link to={`/events/${event.id}`} className="event-card-link">
                <div className={`event-card ${isFull ? 'event-full' : ''}`}>
                  <div className="event-card-header">
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
                      {Math.max(0, seats)} seats left
                    </span>
                  </div>
                  <h3 className="event-card-title">{event.title}</h3>
                  <p className="event-card-desc">{event.description?.slice(0, 90)}{event.description?.length > 90 ? '…' : ''}</p>
                  <div className="event-card-meta">
                    <span><MapPin size={14} /> {event.location}</span>
                    <span><Calendar size={14} /> {event.startDateTime ? format(new Date(event.startDateTime), 'MMM d, yyyy') : 'TBD'}</span>
                    <span><Users size={14} /> {event.currentParticipants}/{event.maxParticipants}</span>
                  </div>
                  {event.organizerName && (
                    <div className="event-organizer">By {event.organizerName}</div>
                  )}
                </div>
              </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={`page-btn ${page === i + 1 ? 'active' : ''}`}
              onClick={() => setPage(i + 1)}
            >{i + 1}</button>
          ))}
          <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </motion.div>
  );
}
