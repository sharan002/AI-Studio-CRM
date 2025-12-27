
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { Lead } from '../types';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: Partial<Lead>) => void;
  initialData?: Lead | null;
  title: string;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({
    userName: '',
    userNumber: '',
    course: 'Python Fullstack with AI',
    location: '',
    leadfrom: 'Manual (Call / Walk-in / Referral)',
    profession: 'Job Seeker',
    status: 'Cold',
    programType: '8 Hours',
    pipeline: 'New'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        userNumber: initialData.userNumber.replace(/^91/, '') // Remove prefix for editing convenience
      });
    } else {
      setFormData({
        userName: '',
        userNumber: '',
        course: 'Python Fullstack with AI',
        location: '',
        leadfrom: 'Manual (Call / Walk-in / Referral)',
        profession: 'Job Seeker',
        status: 'Cold',
        programType: '8 Hours',
        pipeline: 'New'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <Icons.X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Student Name</label>
              <input
                type="text"
                name="userName"
                value={formData.userName || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number (10 digits)</label>
              <input
                type="text"
                name="userNumber"
                value={formData.userNumber || ''}
                onChange={handleChange}
                required
                pattern="\d{10}"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 9876543210"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Course Title</label>
              <select
                name="course"
                value={formData.course || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Python Fullstack with AI">Python Fullstack with AI</option>
                <option value="Java Fullstack with AI">Java Fullstack with AI</option>
                <option value="MERN Stack with AI">MERN Stack with AI</option>
                <option value="Data Science">Data Science</option>
                <option value="Data Analytics">Data Analytics</option>
                <option value="Digital Marketing">Digital Marketing</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Program Type</label>
              <select
                name="programType"
                value={formData.programType || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="8 Hours">8 Hours</option>
                <option value="2 Hours">2 Hours</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Profession</label>
              <select
                name="profession"
                value={formData.profession || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Job Seeker">Job Seeker</option>
                <option value="Student">Student</option>
                <option value="Working Professional">Working Professional</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Lead Source</label>
              <select
                name="leadfrom"
                value={formData.leadfrom || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="Website">Website</option>
                <option value="Manual (Call / Walk-in / Referral)">Manual (Call / Walk-in / Referral)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Lead Status</label>
              <select
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Pipeline Stage</label>
              <select
                name="pipeline"
                value={formData.pipeline || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Asked Time">Asked Time</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City / Region"
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-shadow shadow-md hover:shadow-lg active:scale-95"
          >
            {initialData ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadFormModal;
