'use strict';

/**
 * schemesSeed.js — Sprint 5 Phase 1
 *
 * Seeds the required GovernmentScheme and FundingProgram documents.
 * Idempotent: skips if documents with the same name already exist.
 * Called from the main seed.js after the base seed has run.
 */

const GovernmentScheme = require('../models/GovernmentScheme');
const FundingProgram   = require('../models/FundingProgram');

// ─── Government Schemes (Sprint 5 Phase 1 required set) ──────────────────────

const GOVERNMENT_SCHEMES = [
  {
    name: 'PMEGP',
    description:
      "Prime Minister's Employment Generation Programme — a credit-linked subsidy scheme that " +
      'helps generate self-employment opportunities through establishment of micro-enterprises ' +
      'in the non-farm sector across rural and urban areas.',
    category: 'Subsidy Loan',
    provider: 'Ministry of MSME / KVIC',
    eligibilityCriteria:
      'Individuals above 18 years of age; VIII standard pass for projects above ₹10 Lakhs ' +
      '(manufacturing) or ₹5 Lakhs (service); no income ceiling; new units only.',
    eligibility:
      'Individuals above 18 years, having completed at least VIII standard for projects above ' +
      'Rs. 10 Lakhs in manufacturing.',
    benefits:
      'Subsidy of 15%–35% of project cost. Maximum project cost: ₹50 Lakhs (manufacturing), ' +
      '₹20 Lakhs (service). Balance funded by bank loan.',
    applicationUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
    officialLink:   'https://www.kviconline.gov.in/pmegpeportal/',
    state:          'All',
    industry:       'All',
    fundingAmount:  5000000,
    isActive:       true,
  },
  {
    name: 'Mudra Loan',
    description:
      'Pradhan Mantri MUDRA Yojana (PMMY) — provides collateral-free micro-loans to non-corporate, ' +
      'non-farm small/micro enterprises under three categories: Shishu, Kishor, and Tarun.',
    category: 'Low Interest Loan',
    provider: 'MUDRA Bank / Participating Banks',
    eligibilityCriteria:
      'Non-corporate, non-farm micro/small business entities including proprietorships, ' +
      'partnerships, and self-help groups. No collateral required.',
    eligibility:
      'Small-scale proprietary businesses, vendors, shops, and micro-enterprises needing credit up to Rs. 10 Lakhs.',
    benefits:
      'Collateral-free loans up to ₹10 Lakhs. Shishu: up to ₹50,000; ' +
      'Kishor: ₹50,001–₹5 Lakhs; Tarun: ₹5–₹10 Lakhs.',
    applicationUrl: 'https://www.mudra.org.in',
    officialLink:   'https://www.mudra.org.in',
    state:          'All',
    industry:       'All',
    fundingAmount:  1000000,
    isActive:       true,
  },
  {
    name: 'Startup India',
    description:
      'Startup India Seed Fund Scheme (SISFS) — provides financial assistance to early-stage ' +
      'startups for proof of concept, prototype development, product trials, market entry, ' +
      'and commercialization through DPIIT-recognized incubators.',
    category: 'Grants & Seed Funding',
    provider: 'DPIIT / Ministry of Commerce & Industry',
    eligibilityCriteria:
      'DPIIT-recognized startups incorporated within 2 years with an innovative, ' +
      'technology-driven, scalable business model. Not previously funded by Central/State government.',
    eligibility:
      'DPIIT-recognized startups incorporated within 2 years, with an innovative and technology-driven business model.',
    benefits:
      'Up to ₹20 Lakhs grant for PoC/prototype; up to ₹50 Lakhs through convertible debentures ' +
      'or debt/loans for market entry and scaling.',
    applicationUrl: 'https://www.startupindia.gov.in',
    officialLink:   'https://www.startupindia.gov.in',
    state:          'All',
    industry:       'All',
    fundingAmount:  5000000,
    isActive:       true,
  },
  {
    name: 'Stand-Up India',
    description:
      'Stand-Up India Scheme — facilitates bank loans to SC/ST and women borrowers for setting ' +
      'up greenfield enterprises in manufacturing, services, or the agri-allied sector.',
    category: 'Special Credit Loan',
    provider: 'SIDBI / Scheduled Commercial Banks',
    eligibilityCriteria:
      'SC/ST and/or women entrepreneurs above 18 years. First-time (greenfield) enterprise. ' +
      'Minimum 51% shareholding and controlling stake by SC/ST/woman borrower.',
    eligibility:
      'SC/ST and/or women entrepreneurs above 18 years of age. Greenfield project. ' +
      'Minimum 51% stake must be held by SC/ST/women.',
    benefits:
      'Composite bank loan between ₹10 Lakhs and ₹1 Crore, covering up to 75% of project cost. ' +
      'Dedicated web portal and handholding support provided.',
    applicationUrl: 'https://www.standupmitra.in',
    officialLink:   'https://www.standupmitra.in',
    state:          'All',
    industry:       'All',
    fundingAmount:  10000000,
    isActive:       true,
  },
  {
    name: 'MSME Champions',
    description:
      'MSME Champions Scheme — supports micro, small, and medium enterprises through ' +
      'targeted interventions covering zero-defect zero-effect (ZED) manufacturing, ' +
      'incubation, lean manufacturing, and digital transformation.',
    category: 'Grants & Incubation',
    provider: 'Ministry of MSME',
    eligibilityCriteria:
      'Registered MSMEs in manufacturing or service sector. ' +
      'Sub-schemes have individual eligibility norms (ZED, Incubation, Lean, Digital MSME).',
    eligibility:
      'Registered Micro, Small, and Medium Enterprises engaged in manufacturing or service activities.',
    benefits:
      'Financial assistance for ZED certification, lean manufacturing consultancy, ' +
      'incubation support up to ₹15 Lakhs per idea, and digital tools adoption subsidies.',
    applicationUrl: 'https://msme.gov.in/schemes',
    officialLink:   'https://msme.gov.in/schemes',
    state:          'All',
    industry:       'All',
    fundingAmount:  1500000,
    isActive:       true,
  },
];

// ─── Funding Programs (Sprint 5 Phase 1 required set) ────────────────────────

const FUNDING_PROGRAMS = [
  {
    name: 'Micro Loan',
    fundingType:  'Loan',
    minAmount:    5000,
    maxAmount:    50000,
    amount:       50000,
    provider:     'MUDRA Bank / Microfinance Institutions',
    eligibility:
      'Micro and small business owners in urban and rural areas with no prior formal ' +
      'credit history. No collateral required under Shishu category.',
    industries:   ['All'],
    industry:     'All',
    interestRate: 10.5,
    applicationLink: 'https://www.mudra.org.in',
    isActive:     true,
  },
  {
    name: 'Small Business Loan',
    fundingType:  'Loan',
    minAmount:    50000,
    maxAmount:    2500000,
    amount:       2500000,
    provider:     'State Bank of India / SIDBI Partner Banks',
    eligibility:
      'Existing small businesses with at least 1 year of operations, ' +
      'GST registration, and a clean credit history.',
    industries:   ['Manufacturing', 'Retail', 'Services', 'Food & Catering'],
    industry:     'All',
    interestRate: 9.5,
    applicationLink: 'https://sbi.co.in/web/business/sme',
    isActive:     true,
  },
  {
    name: 'Startup Grant',
    fundingType:  'Grant',
    minAmount:    100000,
    maxAmount:    2000000,
    amount:       2000000,
    provider:     'DPIIT / Startup India',
    eligibility:
      'DPIIT-recognized startups with an innovative product/service. ' +
      'Must not have received prior central government funding for the same project.',
    industries:   ['Technology', 'Agriculture', 'Healthcare', 'Education', 'Clean Energy'],
    industry:     'All',
    interestRate: 0,
    applicationLink: 'https://www.startupindia.gov.in/content/sih/en/apply-for-schemes.html',
    isActive:     true,
  },
];

// ─── Seed function ────────────────────────────────────────────────────────────

/**
 * Idempotently seeds Sprint 5 Phase 1 schemes and funding programs.
 * Only inserts documents whose `name` doesn't already exist.
 */
async function seedSchemeData() {
  try {
    // ── Government Schemes ────────────────────────────────────────────────
    for (const scheme of GOVERNMENT_SCHEMES) {
      const exists = await GovernmentScheme.findOne({ name: scheme.name }).lean();
      if (!exists) {
        await GovernmentScheme.create(scheme);
        console.log(`  ✅ Scheme seeded: ${scheme.name}`);
      } else {
        console.log(`  ℹ️  Scheme already exists — skipping: ${scheme.name}`);
      }
    }

    // ── Funding Programs ──────────────────────────────────────────────────
    for (const program of FUNDING_PROGRAMS) {
      const exists = await FundingProgram.findOne({ name: program.name }).lean();
      if (!exists) {
        await FundingProgram.create(program);
        console.log(`  ✅ Funding program seeded: ${program.name}`);
      } else {
        console.log(`  ℹ️  Funding program already exists — skipping: ${program.name}`);
      }
    }

    console.log('✅ Sprint 5 Phase 1 scheme/funding seed complete');
  } catch (err) {
    console.error('❌ schemesSeed error:', err.message);
  }
}

module.exports = { seedSchemeData };
