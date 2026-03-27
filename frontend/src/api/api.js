import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ──────────────────────────────────────────
export const getMe = () => API.get('/users/me');

// ─── Notifications ─────────────────────────────────
export const getNotifications    = ()    => API.get('/notifications');
export const getUnreadCount      = ()    => API.get('/notifications/count');
export const markAsRead          = (id)  => API.patch(`/notifications/${id}/read`);
export const markAllAsRead       = ()    => API.patch('/notifications/read-all');
export const deleteNotification  = (id) => API.delete(`/notifications/${id}`);

// ─── Users / Admin ─────────────────────────────────
export const getAllUsers     = ()            => API.get('/users');           // ✅ fixed
export const updateUserRole = (id, role)    => API.put(`/users/${id}/roles`, { roles: [role] }); // ✅ fixed

// ─── Resources ─────────────────────────────────────
export const getResources    = ()         => API.get('/resources');
export const createResource  = (data)     => API.post('/resources', data);
export const updateResource  = (id, data) => API.put(`/resources/${id}`, data);
export const deleteResource  = (id)       => API.delete(`/resources/${id}`);

// ─── Bookings ──────────────────────────────────────
export const getBookings    = ()          => API.get('/bookings');
export const createBooking  = (data)      => API.post('/bookings', data);
export const updateBooking  = (id, data)  => API.put(`/bookings/${id}`, data);
export const deleteBooking  = (id)        => API.delete(`/bookings/${id}`);

export default API;