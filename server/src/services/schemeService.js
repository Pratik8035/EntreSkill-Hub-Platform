'use strict';

/**
 * schemeService.js — Sprint 5 Phase 1
 *
 * Pure data-access layer for GovernmentScheme.
 * Controllers call these functions; recommendation logic stays in
 * schemeRecommendationService.js (untouched).
 */

const GovernmentScheme = require('../models/GovernmentScheme');
const AppError = require('../utils/AppError');

class SchemeService {
  /**
   * List schemes with optional filtering and pagination.
   *
   * @param {object} options
   * @param {string}  [options.category]
   * @param {string}  [options.provider]
   * @param {string}  [options.state]
   * @param {string}  [options.search]
   * @param {boolean} [options.isActive]
   * @param {number}  [options.page=1]
   * @param {number}  [options.limit=10]
   * @returns {Promise<{ schemes, total, page, limit, totalPages }>}
   */
  static async listSchemes({ category, provider, state, search, isActive, page = 1, limit = 10 } = {}) {
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (provider) {
      filter.provider = { $regex: provider, $options: 'i' };
    }

    if (state && state !== 'All') {
      filter.state = { $in: [state, 'All', 'National', 'India'] };
    }

    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { eligibility: { $regex: search, $options: 'i' } },
        { eligibilityCriteria: { $regex: search, $options: 'i' } },
        { benefits:    { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [schemes, total] = await Promise.all([
      GovernmentScheme.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GovernmentScheme.countDocuments(filter),
    ]);

    return {
      schemes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a single scheme by its MongoDB ObjectId.
   * Throws AppError(404) if not found.
   *
   * @param {string} id
   * @returns {Promise<GovernmentScheme>}
   */
  static async getSchemeById(id) {
    const scheme = await GovernmentScheme.findById(id).lean();
    if (!scheme) throw new AppError('Government scheme not found', 404);
    return scheme;
  }
}

module.exports = SchemeService;
