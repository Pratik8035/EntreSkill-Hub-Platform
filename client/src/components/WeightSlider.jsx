// src/components/WeightSlider.jsx
// Simple range slider for selecting preference weight (1-5) for an interest.
// Props:
//   value: current numeric value (1-5)
//   onChange: (newValue) => void
//   min/max optional, defaults 1-5.

import React from 'react';

const WeightSlider = ({ value = 1, onChange, min = 1, max = 5 }) => {
  const handleChange = (e) => {
    const newVal = Number(e.target.value);
    if (onChange) onChange(newVal);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={1}
      value={value}
      onChange={handleChange}
      className="ml-2 h-2 w-24 bg-primary-200 rounded-lg hover:bg-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  );
};

export default WeightSlider;
