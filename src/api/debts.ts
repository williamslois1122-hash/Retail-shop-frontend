import { api } from './config';

export const debtsAPI = {
    getAll: () => api.get('/debts/'),
    getById: (id: string) => api.get(`/debts/${id}`),
    getByCustomer: (customerId: string) => api.get(`/debts/customer/${customerId}`),
    create: (data: any) => api.post('/debts/', data),
    update: (id: string, data: any) => api.put(`/debts/${id}`, data),
    markRepaid: (id: string) => api.put(`/debts/repaid/${id}`),
};
