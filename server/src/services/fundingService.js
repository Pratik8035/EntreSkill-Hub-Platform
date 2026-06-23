'use strict';

/**
 * fundingService.js — Sprint 5 Phase 1
 *
 * Pure data-access layer for FundingProgram.
 * Controllers call these functions; recommendation logic stays in
 * schemeRecommendationService.js (untouched).
 */

const FundingProgram  = require('../models/FundingProgram');
// EligibilityRule must be required so Mongoose registers the schema before populate()
require('../models/EligibilityRule');
const AppError = require('../utils/AppError');

class FundingService {
  /**
   * List funding programs with optional filtering and pagination.
   *
   * @param {object} options
   * @param {string}  [options.fundingType]
   * @param {string}  [options.provider]
   * @param {string}  [options.industry]
   * @param {string}  [options.search]
   * @param {boolean} [options.isActive]
   * @param {number}  [options.page=1]
   * @param {number}  [options.limit=10]
   * @returns {Promise<{ programs, total, page, limit, totalPages }>}
   */
  static async listPrograms({ fundingType, provider, industry, search, isActive, page = 1, limit = 10 } = {}) {
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (fundingType) {
      filter.fundingType = fundingType;
    }

    if (provider) {
      filter.provider = { $regex: provider, $options: 'i' };
    }

    if (industry && industry !== 'All') {
      // Match either the legacy single industry field or the new industries array
      filter.$or = [
        { industry:   { $regex: industry, $options: 'i' } },
        { industries: { $regex: industry, $options: 'i' } },
      ];
    }

    if (search) {
      const searchOr = [
        { name:       { $regex: search, $options: 'i' } },
        { provider:   { $regex: search, $options: 'i' } },
        { eligibility:{ $regex: search, $options: 'i' } },
      ];
      // Merge with existing $or if industry filter is active
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchOr }];
        delete filter.$or;
      } else {
        filter.$or = searchOr;
      }
    }

    const skip = (page - 1) * limit;

    const [programs, total] = await Promise.all([
      FundingProgram.find(filter)
        .populate('eligibilityRules')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FundingProgram.countDocuments(filter),
    ]);

    return {
      programs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find a single funding program by its MongoDB ObjectId.
   * Throws AppError(404) if not found.
   *
   * @param {string} id
   * @returns {Promise<FundingProgram>}
   */
  static async getProgramById(id) {
    const program = await FundingProgram.findById(id)
      .populate('eligibilityRules')
      .lean();
    if (!program) throw new AppError('Funding program not found', 404);
    return program;
  }
}

module.exports = FundingService;
