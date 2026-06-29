'use strict';
// src/services/kpiService.js — Sprint 8 Phase 1

const KPI      = require('../models/KPI');
const AppError = require('../utils/AppError');

class KPIService {

  static async listKPIs(userId) {
    return KPI.find({ userId }).sort({ createdAt: -1 });
  }

  static async createKPI(kpiData, userId) {
    const kpi = new KPI({ ...kpiData, userId });
    await kpi.save();
    return kpi;
  }

  static async updateKPI(kpiId, updateData, userId) {
    const kpi = await KPI.findOneAndUpdate(
      { _id: kpiId, userId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!kpi) throw new AppError('KPI not found', 404);
    return kpi;
  }
}

module.exports = KPIService;
