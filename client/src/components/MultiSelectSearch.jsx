// src/components/MultiSelectSearch.jsx
// Custom searchable multi‑select component with category filter and checkboxes.
// Props:
//   items: [{ _id: string, name: string, category: { _id, name } }]
//   selectedIds: array of string (ids currently selected)
//   setSelectedIds: function to update selectedIds array
//   label: string – title for the selector
//   showExtraControl: (item) => ReactNode – optional extra UI per selected item (e.g., proficiency dropdown or weight slider)
//   renderItemLabel: (item) => string – how to display the item name (defaults to item.name)

import { useState, useMemo } from 'react';

const MultiSelectSearch = ({
  items = [],
  selectedIds = [],
  setSelectedIds,
  label = 'Select Items',
  showExtraControl, // function(item) => React element shown next to the item when selected
  renderItemLabel,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const renderedLabel = renderItemLabel || ((it) => it.name);

  // Derive unique categories from items
  const categories = useMemo(() => {
    if (!Array.isArray(items)) return [];
    const cats = items.reduce((acc, cur) => {
      if (cur?.category?.name) acc.add(cur.category.name);
      return acc;
    }, new Set());
    return Array.from(cats);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.filter((it) => {
      const matchesSearch = it.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter ? it.category?.name === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <ul className="max-h-60 overflow-y-auto border border-slate-200 rounded-md p-2 space-y-1">
        {filteredItems.map((it) => (
          <li key={it._id} className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-50">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(it._id)}
                onChange={() => toggleSelection(it._id)}
                className="h-4 w-4 text-primary-600 border-slate-300 rounded"
              />
              <span className="text-sm text-slate-800">{renderedLabel(it)}</span>
            </div>
            {selectedIds.includes(it._id) && showExtraControl && (
              <div className="ml-2">{showExtraControl(it)}</div>
            )}
          </li>
        ))}
        {filteredItems.length === 0 && (
          <li className="text-xs text-slate-400 text-center py-2">No items found.</li>
        )}
      </ul>
    </div>
  );
};



export default MultiSelectSearch;
