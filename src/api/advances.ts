import { api } from './config';

export const advancesAPI = {
    getAll: () => api.get('/advances'),
    getById: (id: string) => api.get(`/advances/${id}`),
    create: (data: any) => api.post('/advances/', data),
    update: (id: string, data: any) => api.put(`/advances/${id}`, data),
    getByCustomer: (customerId: string) => api.get(`/advances/customer/${customerId}`),
    markRepaid: (id: string) => api.put(`/advances/repaid/${id}`),
};
