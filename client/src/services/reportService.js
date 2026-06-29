import api from './api';

// Sprint 9 — Report Service

/**
 * Fetch the list of available report types.
 * @returns {Promise<ReportType[]>}
 */
export const listReportTypes = async () => {
  const res = await api.get('/reports');
  return res.data.data;
};

/**
 * Generate a specific report for the current user.
 * @param {string} type  One of: business_summary | goal_report | kpi_report |
 *                               execution_report | analytics_report | monthly_report | weekly_report
 * @returns {Promise<Report>}
 */
export const getReport = async (type) => {
  const res = await api.get(`/reports/${type}`);
  return res.data.data;
};
