import { api } from './config';

export const itemsAPI = {
    getAll: () => api.get('/items/'),
    getById: (id: string) => api.get(`/items/${id}`),
    create: (data: any) => api.post('/items/', data),
    update: (id: string, data: any) => api.put(`/items/${id}`, data),
};

