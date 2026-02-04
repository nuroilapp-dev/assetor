import api from './client';

export const getPremises = async (type) => {
    const response = await api.get(`office/premises?type=${type}`);
    return response.data;
};

export const getPremiseById = async (id) => {
    const response = await api.get(`office/premises/${id}`);
    return response.data;
};

export const createPremise = async (data) => {
    const response = await api.post('office/premises', data);
    return response.data;
};

export const updatePremise = async (id, data) => {
    const response = await api.put(`office/premises/${id}`, data);
    return response.data;
};

export const deletePremise = async (id) => {
    const response = await api.delete(`office/premises/${id}`);
    return response.data;
};

export const uploadFile = async (fileData) => {
    const response = await api.post('office/upload', fileData);
    return response.data;
};

export const getCompanyModules = async () => {
    const response = await api.get('company-modules');
    return response.data;
};
