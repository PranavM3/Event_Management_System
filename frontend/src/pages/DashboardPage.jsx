import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllEvents } from '../api/events';
import { getMyRegistrations } from '../api/registrations';
import { getMyFeedbacks } from '../api/feedbacks';
import { getMyEvents } from '../api/events';
import { Link } from 'react-router-dom';
import { Calendar, Users, MessageSquare, TrendingUp, Clock, CheckCircle, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon"><Icon size={24} /></div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, isOrganizer } = useAuth();
  const [events, setEvents] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [evRes] = await Promise.allSettled([getAllEvents()]);
        if (evRes.status === 'fulfilled') setEvents(evRes.value.data || []);

        if (!isOrganizer() && !isAdmin()) {
          const [regRes, fbRes] = await Promise.allSettled([getMyRegistrations(), getMyFeedbacks()]);
          if (regRes.status === 'fulfilled') setMyRegs(regRes.value.data || []);
          if (fbRes.status === 'fulfilled') setMyFeedbacks(fbRes.value.data || []);
        }

        if (isOrganizer() || isAdmin()) {
          const [meRes] = await Promise.allSettled([getMyEvents()]);
          if (meRes.status === 'fulfilled') setMyEvents(meRes.value.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
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

  const upcomingEvents = events.filter((e) => e.status === 'UPCOMING').slice(0, 4);

  return (
    <motion.div 
      className="page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero greeting */}
      <div className="dashboard-hero">
        <div>
          <h1 className="page-title" ref={titleRef}>
            Dashboard Overview
          </h1>
          <p className="page-subtitle">Welcome to your EventSphere dashboard.</p>
        </div>
        {(isOrganizer() || isAdmin()) && (
          <Link to="/events/create" className="btn btn-primary">
            <PlusCircle size={18} /> Create Event
          </Link>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="stat-card skeleton-stat" />)}
        </div>
      ) : (
        <motion.div className="stats-grid" variants={containerVariants} initial="hidden" animate="show">
          <motion.div variants={itemVariants}><StatCard icon={Calendar} label="Total Events" value={events.length} color="blue" /></motion.div>
          {!isOrganizer() && !isAdmin() && (
            <>
              <motion.div variants={itemVariants}><StatCard icon={Users} label="My Registrations" value={myRegs.length} color="purple" /></motion.div>
              <motion.div variants={itemVariants}><StatCard icon={MessageSquare} label="My Feedbacks" value={myFeedbacks.length} color="green" /></motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  icon={CheckCircle}
                  label="Attended"
                  value={myRegs.filter(r => r.attended).length}
                  color="orange"
                />
              </motion.div>
            </>
          )}
          {(isOrganizer() || isAdmin()) && (
            <>
              <motion.div variants={itemVariants}><StatCard icon={TrendingUp} label="My Events" value={myEvents.length} color="purple" /></motion.div>
              <motion.div variants={itemVariants}><StatCard icon={Clock} label="Upcoming" value={myEvents.filter(e => e.status === 'UPCOMING').length} color="green" /></motion.div>
              <motion.div variants={itemVariants}><StatCard icon={CheckCircle} label="Completed" value={myEvents.filter(e => e.status === 'COMPLETED').length} color="orange" /></motion.div>
            </>
          )}
        </motion.div>
      )}

      {/* Upcoming events */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Upcoming Events</h2>
          <Link to="/events" className="section-link">View all →</Link>
        </div>

        {loading ? (
          <div className="events-grid">
            {[1, 2, 3, 4].map((i) => <div key={i} className="event-card skeleton-event" />)}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No upcoming events at the moment.</p>
          </div>
        ) : (
          <motion.div className="events-grid" variants={containerVariants} initial="hidden" animate="show">
            {upcomingEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <Link to={`/events/${event.id}`} className="event-card-link">
                <div className="event-card">
                  <div className="event-card-header">
                    {(() => {
                      const isFull = event.currentParticipants >= event.maxParticipants;
                      let badgeClass = 'status-upcoming';
                      let badgeText = 'UPCOMING';
                      
                      if (event.status === 'CANCELLED') {
                        badgeClass = 'status-cancelled';
                        badgeText = 'CANCELLED';
                      } else if (isFull && !event.hasWaitlist) {
                        badgeClass = 'seats-badge full';
                        badgeText = 'FULL';
                      } else if (isFull && event.hasWaitlist) {
                        badgeClass = 'status-waitlisted';
                        badgeText = 'WAITLIST';
                      }

                      return (
                        <span className={`status-badge ${badgeClass}`}>
                          {badgeText}
                        </span>
                      );
                    })()}
                    <span className="event-seats">
                      {Math.max(0, event.maxParticipants - (event.currentParticipants || 0))} seats left
                    </span>
                  </div>
                  <h3 className="event-card-title">{event.title}</h3>
                  <p className="event-card-desc">{event.description?.slice(0, 80)}...</p>
                  <div className="event-card-meta">
                    <span>📍 {event.location}</span>
                    <span>📅 {event.startDateTime ? format(new Date(event.startDateTime), 'MMM d, yyyy') : 'TBD'}</span>
                  </div>
                </div>
              </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
