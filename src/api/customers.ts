import { api } from './config';

export const customersAPI = {
    getAll: () => api.get('/customers'),
    getById: (id: string) => api.get(`/customers/${id}`),
    create: (data: any) => api.post('/customers', data),
    update: (id: string, data: any) => api.put(`/customers/${id}`, data),
};
