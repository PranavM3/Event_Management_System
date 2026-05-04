import API from './axios';

export const getAllEvents = () => API.get('/events');
export const getEventById = (id) => API.get(`/events/${id}`);
export const getMyEvents = () => API.get('/events/my-events');
export const getEventsByStatus = (status) => API.get(`/events/status/${status}`);
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const updateEventStatus = (id, status) => API.patch(`/events/${id}/status?status=${status}`);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
