// src/services/draftStorage.js
// Simple wrapper around localStorage for persisting the assessment wizard draft.

const DRAFT_KEY = 'assessmentDraft';

export const saveDraft = (data) => {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(DRAFT_KEY, serialized);
  } catch (err) {
    console.error('Failed to save assessment draft:', err);
  }
};

export const loadDraft = () => {
  try {
    const serialized = localStorage.getItem(DRAFT_KEY);
    return serialized ? JSON.parse(serialized) : null;
  } catch (err) {
    console.error('Failed to load assessment draft:', err);
    return null;
  }
};

export const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.error('Failed to clear assessment draft:', err);
  }
};
