import API from './axios';

export const registerForEvent = (eventId) => API.post('/registrations', { eventId });
export const getMyRegistrations = () => API.get('/registrations/my-registrations');
export const getEventRegistrations = (eventId) => API.get(`/registrations/event/${eventId}`);
export const getRegistrationById = (id) => API.get(`/registrations/${id}`);
export const markAttendance = (id) => API.patch(`/registrations/${id}/attendance`);
export const cancelRegistration = (id) => API.delete(`/registrations/${id}`);
