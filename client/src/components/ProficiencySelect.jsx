// src/components/ProficiencySelect.jsx
// Simple dropdown for selecting proficiency level for a skill.
// Props:
//   value: currently selected string
//   onChange: (newValue) => void
//   options: optional array of { value, label }

import React from 'react';

const defaultOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const ProficiencySelect = ({ value, onChange, options = defaultOptions }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="ml-2 px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default ProficiencySelect;
