
import React from 'react';
import { Icons } from './Icons';
import { FilterState } from '../App';
import { User } from '../types';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  users: User[];
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

const COURSES = ["Python Fullstack with AI", "Java Fullstack with AI", "MERN Stack with AI", "Data Science", "Data Analytics", "Digital Marketing"];
const PROGRAM_TYPES = ["8 Hours", "2 Hours"];
const PROFESSIONS = ["Job Seeker", "Student", "Working Professional"];
const SOURCES = ["WhatsApp", "Meta Ads", "Website", "Manual (Call / Walk-in / Referral)"];
const STATUSES = ["Hot", "Warm", "Cold"];
const PIPELINES = ["New", "Contacted", "Asked Time", "Not Interested"];

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, filters, users, onFilterChange, onReset }) => {
  const toggleFilter = (category: keyof FilterState, value: string) => {
    const current = filters[category] as string[];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    onFilterChange({ ...filters, [category]: updated });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value });
  };

  const staffNames = users.map(u => u.username);

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l border-slate-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Advanced Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full">
            <Icons.X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Date Range */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Date Created Range</h3>
            <div className="space-y-2">
              <input 
                type="date" 
                name="fromDate"
                value={filters.fromDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <p className="text-[10px] text-center text-slate-400">to</p>
              <input 
                type="date" 
                name="toDate"
                value={filters.toDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>

          <FilterGroup label="Lead Status" options={STATUSES} selected={filters.statuses} onToggle={(val) => toggleFilter('statuses', val)} />
          
          <FilterGroup label="Assigned Staff" options={staffNames} selected={filters.assignedUsers} onToggle={(val) => toggleFilter('assignedUsers', val)} />

          <FilterGroup label="Course Title" options={COURSES} selected={filters.courses} onToggle={(val) => toggleFilter('courses', val)} />
          <FilterGroup label="Pipeline Stage" options={PIPELINES} selected={filters.pipelines} onToggle={(val) => toggleFilter('pipelines', val)} />
          <FilterGroup label="Profession" options={PROFESSIONS} selected={filters.professions} onToggle={(val) => toggleFilter('professions', val)} />
          <FilterGroup label="Lead Source" options={SOURCES} selected={filters.sources} onToggle={(val) => toggleFilter('sources', val)} />
          <FilterGroup label="Program Type" options={PROGRAM_TYPES} selected={filters.programTypes} onToggle={(val) => toggleFilter('programTypes', val)} />
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={onReset}
            className="flex-1 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

interface FilterGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}

const FilterGroup: React.FC<FilterGroupProps> = ({ label, options, selected, onToggle }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</h3>
    <div className="flex flex-wrap gap-2">
      {options.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No options available</p>
      ) : (
        options.map(option => (
          <button
            key={option}
            onClick={() => onToggle(option)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              selected.includes(option)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
            }`}
          >
            {option}
          </button>
        ))
      )}
    </div>
  </div>
);

export default FilterPanel;
