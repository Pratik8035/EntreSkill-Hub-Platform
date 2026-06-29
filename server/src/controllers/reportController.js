'use strict';

// reportController.js — Sprint 9 Phase 3

const asyncHandler = require('express-async-handler');
const ReportService = require('../services/reportService');
const { sendSuccess } = require('../utils/responseHandler');

/**
 * GET /api/reports
 * Return the list of available report types (no DB query).
 */
const listReports = asyncHandler(async (req, res) => {
  const reports = ReportService.listReports();
  sendSuccess(res, reports, 'Report types retrieved successfully');
});

/**
 * GET /api/reports/:type
 * Generate and return the requested report for the authenticated user.
 */
const getReport = asyncHandler(async (req, res) => {
  const report = await ReportService.getReport(req.params.type, req.user._id);
  sendSuccess(res, report, 'Report generated successfully');
});

module.exports = { listReports, getReport };
