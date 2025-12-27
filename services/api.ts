
import { Lead, ApiResponse, User } from '../types';

const BASE_URL = 'http://localhost:3001';

export const apiService = {
  async fetchAllData(): Promise<ApiResponse> {
    const response = await fetch(`${BASE_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch data');
    return response.json();
  },

  async addLead(leadData: Partial<Lead>): Promise<{ success: boolean; user: Lead }> {
    const response = await fetch(`${BASE_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });
    if (!response.ok) throw new Error('Failed to update lead');
    return response.json();
  },

  async editLeadDetails(leadData: Partial<Lead>): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/Users/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });
    if (!response.ok) throw new Error('Failed to edit lead details');
    return response.json();
  },

  async deleteLead(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete lead');
    return response.json();
  },

  async addRemark(leadId: string, remark: string): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/Users/remarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: leadId, remark }),
    });
    if (!response.ok) throw new Error('Failed to add remark');
    return response.json();
  },

  async deleteRemark(leadId: string, remarkId: string): Promise<Lead> {
    const response = await fetch(`${BASE_URL}/Users/remarks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _id: leadId, remarkId }),
    });
    if (!response.ok) throw new Error('Failed to delete remark');
    return response.json();
  },
};
