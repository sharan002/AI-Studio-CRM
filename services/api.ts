
import { Lead, User, DashboardResponse } from '../types';

const BASE_URL = 'http://localhost:3001';

const getHeaders = () => {
  const token = localStorage.getItem('crm_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const apiService = {
  async login(credentials: any) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  async fetchDashboardData(username: string): Promise<DashboardResponse> {
    const response = await fetch(`${BASE_URL}/dashboard`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username }),
    });
    if (!response.ok) throw new Error('Session expired or unauthorized');
    return response.json();
  },

  async addLead(leadData: Partial<Lead>): Promise<{ success: boolean; user: Lead }> {
    const response = await fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(leadData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add lead');
    }
    return response.json();
  },

  async updateLead(leadData: Partial<Lead>): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/Users`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(leadData),
    });
    if (!response.ok) throw new Error('Failed to update lead');
    return response.json();
  },

  async editLeadDetails(leadData: Partial<Lead>): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/Users/edit`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(leadData),
    });
    if (!response.ok) throw new Error('Failed to edit lead details');
    return response.json();
  },

  async deleteLead(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete lead');
    return response.json();
  },

  async addRemark(leadId: string, remark: string): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/Users/remarks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ _id: leadId, remark }),
    });
    if (!response.ok) throw new Error('Failed to add remark');
    return response.json();
  },

  async deleteRemark(leadId: string, remarkId: string): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/Users/remarks`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ _id: leadId, remarkId }),
    });
    if (!response.ok) throw new Error('Failed to delete remark');
    return response.json();
  },
};
