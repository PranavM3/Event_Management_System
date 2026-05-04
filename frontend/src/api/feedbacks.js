import API from './axios';

export const submitFeedback = (data) => API.post('/feedbacks', data);
export const getEventFeedbacks = (eventId) => API.get(`/feedbacks/event/${eventId}`);
export const getMyFeedbacks = () => API.get('/feedbacks/my-feedbacks');
export const getAverageRating = (eventId) => API.get(`/feedbacks/event/${eventId}/average-rating`);
export const deleteFeedback = (id) => API.delete(`/feedbacks/${id}`);
