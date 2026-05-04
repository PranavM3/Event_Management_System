import API from './axios';

export const signup = (data) => API.post('/auth/signup', data);
export const signin = (data) => API.post('/auth/signin', data);
export const getUserById = (id) => API.get(`/users/organizer/${id}`);
