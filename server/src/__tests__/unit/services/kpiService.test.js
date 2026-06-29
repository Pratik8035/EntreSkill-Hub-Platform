// src/__tests__/unit/services/kpiService.test.js
// Unit tests for KPIService — Sprint 8 Phase 1

const KPIService = require('../../../services/kpiService');
const KPI = require('../../../models/KPI');
const mongoose = require('mongoose');

describe('KPIService', () => {
  let userId;

  beforeAll(async () => {
    userId = new mongoose.Types.ObjectId();
  });

  afterEach(async () => {
    await KPI.deleteMany({});
  });

  describe('listKPIs', () => {
    it('should return an empty array when no KPIs exist', async () => {
      const kpis = await KPIService.listKPIs(userId);
      expect(kpis).toEqual([]);
    });

    it('should return KPIs for a specific user', async () => {
      const kpiData = {
        userId,
        name: 'Test KPI',
        targetValue: 100,
        currentValue: 50,
        unit: '%',
      };
      await KPI.create(kpiData);

      const kpis = await KPIService.listKPIs(userId);
      expect(kpis).toHaveLength(1);
      expect(kpis[0].name).toBe('Test KPI');
    });

    it('should not return KPIs from other users', async () => {
      const otherUserId = new mongoose.Types.ObjectId();
      
      await KPI.create({
        userId: otherUserId,
        name: 'Other User KPI',
        targetValue: 100,
      });

      await KPI.create({
        userId,
        name: 'My KPI',
        targetValue: 100,
      });

      const kpis = await KPIService.listKPIs(userId);
      expect(kpis).toHaveLength(1);
      expect(kpis[0].name).toBe('My KPI');
    });
  });

  describe('createKPI', () => {
    it('should create a new KPI', async () => {
      const kpiData = {
        name: 'New KPI',
        targetValue: 200,
        currentValue: 100,
        unit: '₹',
      };

      const kpi = await KPIService.createKPI(kpiData, userId);
      expect(kpi).toBeDefined();
      expect(kpi.name).toBe('New KPI');
      expect(kpi.userId.toString()).toBe(userId.toString());
    });

    it('should set default values for optional fields', async () => {
      const kpiData = {
        name: 'Minimal KPI',
        targetValue: 100,
      };

      const kpi = await KPIService.createKPI(kpiData, userId);
      expect(kpi.currentValue).toBe(0);
      expect(kpi.unit).toBeUndefined();
    });
  });
});
