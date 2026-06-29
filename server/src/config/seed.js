// src/config/seed.js – Production‑ready deterministic seeding for EntreSkill Hub

const mongoose = require('mongoose');
const SkillCategory = require('../models/SkillCategory');
const Skill = require('../models/Skill');
const InterestCategory = require('../models/InterestCategory');
const Interest = require('../models/Interest');
const GovernmentScheme = require('../models/GovernmentScheme');
const FundingProgram = require('../models/FundingProgram');
const User = require('../models/User');
const { seedBusinessData } = require('./businessIdeasSeed');
const { seedSchemeData } = require('./schemesSeed');

/**
 * Business‑oriented seed data aligned with EntreSkill Hub requirements.
 * All categories, skills, and interests are deterministic and idempotent.
 */

// ---- Skill Categories -----------------------------------------------------
const skillCategories = [
  { name: 'Tailoring & Fashion', icon: 'tailoring.svg' },
  { name: 'Food & Catering', icon: 'food.svg' },
  { name: 'Handicrafts', icon: 'handicrafts.svg' },
  { name: 'Beauty & Wellness', icon: 'beauty.svg' },
  { name: 'Repair Services', icon: 'repair.svg' },
  { name: 'Agriculture', icon: 'agriculture.svg' },
  { name: 'Digital Services', icon: 'digital.svg' },
  { name: 'Education & Training', icon: 'education.svg' },
  { name: 'Home Services', icon: 'home.svg' },
  { name: 'Retail & Trading', icon: 'retail.svg' },
];

// ---- Skills (5 per category) --------------------------------------------
const skills = [
  // Tailoring & Fashion
  { name: 'Custom Dressmaking', description: 'Design and sew bespoke garments', tags: ['sewing', 'design'], businessCategories: ['Fashion'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Alterations', description: 'Tailor existing clothing to fit', tags: ['alterations', 'fit'], businessCategories: ['Fashion'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Embroidery', description: 'Create decorative stitched patterns', tags: ['embroidery', 'craft'], businessCategories: ['Fashion'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Pattern Making', description: 'Develop garment patterns for production', tags: ['pattern', 'design'], businessCategories: ['Fashion'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Fashion Consulting', description: 'Advise on style trends and personal branding', tags: ['consulting', 'style'], businessCategories: ['Fashion'], popularityScore: 0, demandScore: 0, isActive: true },

  // Food & Catering
  { name: 'Home Catering', description: 'Prepare meals for small events', tags: ['catering', 'home'], businessCategories: ['Food'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Bakery Products', description: 'Bake breads, pastries, and cakes', tags: ['baking', 'pastry'], businessCategories: ['Food'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Meal Planning', description: 'Create weekly meal plans for families', tags: ['planning', 'nutrition'], businessCategories: ['Food'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Street Food Stall', description: 'Operate a mobile food vending unit', tags: ['street food', 'vending'], businessCategories: ['Food'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Specialty Catering', description: 'Cater to dietary restrictions (vegan, gluten‑free)', tags: ['special diet', 'catering'], businessCategories: ['Food'], popularityScore: 0, demandScore: 0, isActive: true },

  // Handicrafts
  { name: 'Woodwork', description: 'Craft furniture and decorative items from wood', tags: ['carpentry', 'wood'], businessCategories: ['Crafts'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Pottery', description: 'Create functional and decorative ceramics', tags: ['ceramics', 'clay'], businessCategories: ['Crafts'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Jewellery Making', description: 'Design and fabricate hand‑made jewellery', tags: ['jewellery', 'design'], businessCategories: ['Crafts'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Textile Crafts', description: 'Produce hand‑loomed fabrics and accessories', tags: ['loom', 'fabric'], businessCategories: ['Crafts'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Paper Craft', description: 'Create origami, cards, and paper decorations', tags: ['paper', 'origami'], businessCategories: ['Crafts'], popularityScore: 0, demandScore: 0, isActive: true },

  // Beauty & Wellness
  { name: 'Makeup Artistry', description: 'Provide professional makeup services', tags: ['makeup', 'beauty'], businessCategories: ['Wellness'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Hair Styling', description: 'Cut, color, and style hair', tags: ['hair', 'styling'], businessCategories: ['Wellness'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Massage Therapy', description: 'Offer therapeutic body massages', tags: ['massage', 'therapy'], businessCategories: ['Wellness'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Facial Treatments', description: 'Provide skin care and facial services', tags: ['facial', 'skincare'], businessCategories: ['Wellness'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Wellness Coaching', description: 'Guide clients on holistic health practices', tags: ['coaching', 'health'], businessCategories: ['Wellness'], popularityScore: 0, demandScore: 0, isActive: true },

  // Repair Services
  { name: 'Electronics Repair', description: 'Fix smartphones, laptops, and gadgets', tags: ['electronics', 'repair'], businessCategories: ['Repair'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Plumbing', description: 'Install and repair plumbing systems', tags: ['plumbing', 'maintenance'], businessCategories: ['Repair'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Carpentry Repair', description: 'Repair wooden structures and furniture', tags: ['carpentry', 'repair'], businessCategories: ['Repair'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Appliance Repair', description: 'Service home appliances (washing machine, fridge)', tags: ['appliance', 'repair'], businessCategories: ['Repair'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Vehicle Maintenance', description: 'Basic auto service and maintenance', tags: ['auto', 'maintenance'], businessCategories: ['Repair'], popularityScore: 0, demandScore: 0, isActive: true },

  // Agriculture
  { name: 'Organic Farming', description: 'Grow chemical‑free crops', tags: ['organic', 'farming'], businessCategories: ['Agriculture'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Livestock Management', description: 'Raise and care for cattle, goats, etc.', tags: ['livestock', 'animal'], businessCategories: ['Agriculture'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Urban Gardening', description: 'Set up rooftop or balcony gardens', tags: ['urban', 'gardening'], businessCategories: ['Agriculture'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Agri‑Consultancy', description: 'Advise on crop rotation and soil health', tags: ['consultancy', 'soil'], businessCategories: ['Agriculture'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Bee‑Keeping', description: 'Maintain beehives for honey production', tags: ['beekeeping', 'honey'], businessCategories: ['Agriculture'], popularityScore: 0, demandScore: 0, isActive: true },

  // Digital Services
  { name: 'Web Development', description: 'Build websites and web applications', tags: ['web', 'frontend', 'backend'], businessCategories: ['Digital'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Graphic Design', description: 'Create visual assets for brands', tags: ['design', 'branding'], businessCategories: ['Digital'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Digital Marketing', description: 'Run SEO, SEM and social campaigns', tags: ['seo', 'ads'], businessCategories: ['Digital'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Content Writing', description: 'Produce blog posts, copy, and articles', tags: ['writing', 'content'], businessCategories: ['Digital'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'App Development', description: 'Create mobile applications for iOS/Android', tags: ['mobile', 'react‑native'], businessCategories: ['Digital'], popularityScore: 0, demandScore: 0, isActive: true },

  // Education & Training
  { name: 'Language Tutoring', description: 'Teach foreign languages online or offline', tags: ['tutor', 'language'], businessCategories: ['Education'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Skill Workshops', description: 'Run hands‑on workshops (e.g., pottery, coding)', tags: ['workshop', 'hands‑on'], businessCategories: ['Education'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Exam Preparation', description: 'Prepare students for competitive exams', tags: ['exam', 'coaching'], businessCategories: ['Education'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Corporate Training', description: 'Deliver soft‑skill training for companies', tags: ['corporate', 'soft‑skill'], businessCategories: ['Education'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Online Course Creation', description: 'Design and publish e‑learning courses', tags: ['e‑learning', 'course'], businessCategories: ['Education'], popularityScore: 0, demandScore: 0, isActive: true },

  // Home Services
  { name: 'House Cleaning', description: 'Provide residential cleaning services', tags: ['cleaning', 'home'], businessCategories: ['Home'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Interior Decorating', description: 'Design interior spaces for homes', tags: ['interior', 'decor'], businessCategories: ['Home'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Garden Maintenance', description: 'Maintain lawns and garden areas', tags: ['garden', 'maintenance'], businessCategories: ['Home'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Moving Services', description: 'Assist with residential relocation', tags: ['moving', 'relocation'], businessCategories: ['Home'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Pet Sitting', description: 'Take care of pets while owners are away', tags: ['pet', 'sitting'], businessCategories: ['Home'], popularityScore: 0, demandScore: 0, isActive: true },

  // Retail & Trading
  { name: 'Boutique Management', description: 'Run a small fashion retail shop', tags: ['boutique', 'retail'], businessCategories: ['Retail'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Online Marketplace Seller', description: 'Sell goods on platforms like Amazon', tags: ['e‑commerce', 'seller'], businessCategories: ['Retail'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Wholesale Trading', description: 'Buy and sell products in bulk', tags: ['wholesale', 'trading'], businessCategories: ['Retail'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Handicraft Retail', description: 'Sell handmade items through a physical store', tags: ['handicraft', 'store'], businessCategories: ['Retail'], popularityScore: 0, demandScore: 0, isActive: true },
  { name: 'Food Stall Vendor', description: 'Operate a small food stall in markets', tags: ['food', 'stall'], businessCategories: ['Retail'], popularityScore: 0, demandScore: 0, isActive: true },
];

// ---- Interest Categories ---------------------------------------------------
const interestCategories = [
  { name: 'Entrepreneurship', icon: 'entrepreneurship.svg' },
  { name: 'Sustainability', icon: 'sustainability.svg' },
  { name: 'Technology Adoption', icon: 'tech.svg' },
  { name: 'Community Development', icon: 'community.svg' },
  { name: 'Creative Arts', icon: 'arts.svg' },
];

// ---- Interests (3‑5 per category) --------------------------------------
const interests = [
  // Entrepreneurship
  { name: 'Startup Funding', description: 'Explore sources of capital for new ventures', tags: ['funding', 'venture'], businessCategories: ['Finance'], isActive: true },
  { name: 'Lean Business Models', description: 'Build efficient, low‑cost business structures', tags: ['lean', 'model'], businessCategories: ['Strategy'], isActive: true },
  { name: 'Franchising', description: 'Expand business through franchise networks', tags: ['franchise'], businessCategories: ['Growth'], isActive: true },

  // Sustainability
  { name: 'Eco-friendly Materials', description: 'Use sustainable inputs in production', tags: ['eco', 'materials'], businessCategories: ['Sustainability'], isActive: true },
  { name: 'Circular Economy', description: 'Design processes that reuse waste', tags: ['circular', 'reuse'], businessCategories: ['Sustainability'], isActive: true },
  { name: 'Renewable Energy Adoption', description: 'Integrate solar/wind power into operations', tags: ['renewable', 'energy'], businessCategories: ['Energy'], isActive: true },

  // Technology Adoption
  { name: 'Digital Transformation', description: 'Migrate traditional processes to digital', tags: ['digital', 'transformation'], businessCategories: ['Digital'], isActive: true },
  { name: 'Automation', description: 'Implement bots and RPA for efficiency', tags: ['automation', 'RPA'], businessCategories: ['Efficiency'], isActive: true },
  { name: 'E-commerce Platforms', description: 'Sell products via online storefronts', tags: ['e-commerce', 'platform'], businessCategories: ['Retail'], isActive: true },

  // Community Development
  { name: 'Local Partnerships', description: 'Collaborate with nearby businesses', tags: ['partnership', 'local'], businessCategories: ['Growth'], isActive: true },
  { name: 'Skill Sharing Networks', description: 'Exchange expertise within a community', tags: ['skillshare', 'network'], businessCategories: ['Education'], isActive: true },

  // Creative Arts
  { name: 'Artisan Marketplaces', description: 'Showcase handcrafted goods online', tags: ['artisan', 'marketplace'], businessCategories: ['Retail'], isActive: true },
  { name: 'Cultural Events', description: 'Organise festivals and exhibitions', tags: ['culture', 'events'], businessCategories: ['Community'], isActive: true },
];

/**
 * Safe seeding function – only seeds if the respective collection is empty.
 * This prevents duplicate inserts and works in both development and production.
 */
async function runSeed() {
  try {
    // ---- Admin User ----
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'bugadepratik123@gmail.com',
        password: 'Pratik@123',
        role: 'admin',
        isVerified: true,
        profile: {
          skills: ['administration', 'management'],
          location: 'HQ',
          bio: 'System Administrator for EntreSkill Hub Platform',
          phoneNumber: '1234567890'
        }
      });
      console.log('✅ Default admin user seeded (admin@entreskill.com / adminpassword)');
    } else {
      console.log('ℹ️ Admin user already exists – skipping');
    }

    // ---- Skill Categories ----
    const catCount = await SkillCategory.estimatedDocumentCount();
    if (catCount === 0) {
      await SkillCategory.insertMany(skillCategories);
      console.log('✅ Skill categories seeded');
    } else {
      console.log('ℹ️ Skill categories already exist – skipping');
    }

    // ---- Skills ----
    const skillCount = await Skill.estimatedDocumentCount();
    if (skillCount === 0) {
      // Resolve deterministic category IDs based on businessCategories[0]
      const categories = await SkillCategory.find({});
      const categoryMap = {};
      categories.forEach((c) => (categoryMap[c.name] = c._id));

      const categoryNameMap = {
        'Fashion': 'Tailoring & Fashion',
        'Food': 'Food & Catering',
        'Crafts': 'Handicrafts',
        'Wellness': 'Beauty & Wellness',
        'Repair': 'Repair Services',
        'Agriculture': 'Agriculture',
        'Digital': 'Digital Services',
        'Education': 'Education & Training',
        'Home': 'Home Services',
        'Retail': 'Retail & Trading'
      };

      const skillDocs = skills.map((s) => {
        const targetCategoryName = categoryNameMap[s.businessCategories[0]] || s.businessCategories[0];
        return {
          ...s,
          categoryId: categoryMap[targetCategoryName] || null,
        };
      });
      await Skill.insertMany(skillDocs);
      console.log('✅ Skills seeded');
    } else {
      console.log('ℹ️ Skills already exist – skipping');
    }

    // ---- Interest Categories ----
    const intCatCount = await InterestCategory.estimatedDocumentCount();
    if (intCatCount === 0) {
      await InterestCategory.insertMany(interestCategories);
      console.log('✅ Interest categories seeded');
    } else {
      console.log('ℹ️ Interest categories already exist – skipping');
    }

    // ---- Interests ----
    const interestCount = await Interest.estimatedDocumentCount();
    if (interestCount === 0) {
      const intCategories = await InterestCategory.find({});
      const intCatMap = {};
      intCategories.forEach((c) => (intCatMap[c.name] = c._id));

      const interestToCategoryMap = {
        'Startup Funding': 'Entrepreneurship',
        'Lean Business Models': 'Entrepreneurship',
        'Franchising': 'Entrepreneurship',
        'Eco-friendly Materials': 'Sustainability',
        'Circular Economy': 'Sustainability',
        'Renewable Energy Adoption': 'Sustainability',
        'Digital Transformation': 'Technology Adoption',
        'Automation': 'Technology Adoption',
        'E-commerce Platforms': 'Technology Adoption',
        'Local Partnerships': 'Community Development',
        'Skill Sharing Networks': 'Community Development',
        'Artisan Marketplaces': 'Creative Arts',
        'Cultural Events': 'Creative Arts'
      };

      const interestDocs = interests.map((i) => {
        const targetCategoryName = interestToCategoryMap[i.name] || i.name;
        return {
          ...i,
          categoryId: intCatMap[targetCategoryName] || null,
        };
      });
      await Interest.insertMany(interestDocs);
      console.log('✅ Interests seeded');
    } else {
      console.log('ℹ️ Interests already exist – skipping');
    }

    // ---- Government Schemes ----
    const schemeCount = await GovernmentScheme.estimatedDocumentCount();
    if (schemeCount === 0) {
      const schemes = [
        {
          name: 'Startup India Seed Fund Scheme (SISFS)',
          description: 'Provides financial assistance to early-stage startups for proof of concept, prototype development, product trials, market entry, and commercialization.',
          eligibility: 'DPIIT-recognized startups incorporated within 2 years, with an innovative and technology-driven business model.',
          category: 'Grants & Seed Funding',
          benefits: 'Grant of up to INR 20 Lakhs for validation of prototype/PoC; up to INR 50 Lakhs through convertible debentures or debt/loans.',
          officialLink: 'https://www.startupindia.gov.in',
          state: 'All',
          industry: 'All',
          fundingAmount: 2000000,
        },
        {
          name: "Prime Minister's Employment Generation Programme (PMEGP)",
          description: 'A credit-linked subsidy scheme for generating employment through new micro-enterprises in manufacturing and service sectors.',
          eligibility: 'Individuals above 18 years, having completed at least VIII standard for projects above Rs. 10 Lakhs in manufacturing.',
          category: 'Subsidy Loan',
          benefits: 'Subsidy between 15% to 35% of project cost; maximum project cost admissible Rs. 50 Lakhs (manufacturing) or Rs. 20 Lakhs (services).',
          officialLink: 'https://www.kviconline.gov.in/pmegpeportal/',
          state: 'All',
          industry: 'All',
          fundingAmount: 5000000,
        },
        {
          name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
          description: 'Provides collateral-free micro-loans to non-corporate, non-farm small/micro enterprises under Shishu, Kishor, and Tarun categories.',
          eligibility: 'Small-scale proprietary businesses, vendors, shops, and micro-enterprises needing credit up to Rs. 10 Lakhs.',
          category: 'Low Interest Loan',
          benefits: 'Collateral-free loans up to Rs. 10 Lakhs. Categories: Shishu (up to Rs. 50,000), Kishor (up to Rs. 5 Lakhs), Tarun (up to Rs. 10 Lakhs).',
          officialLink: 'https://www.mudra.org.in',
          state: 'All',
          industry: 'All',
          fundingAmount: 1000000,
        },
        {
          name: 'Stand-Up India Scheme',
          description: 'Promotes greenfield entrepreneurship among SC, ST, and women candidates by facilitating bank loans.',
          eligibility: 'SC/ST and/or women entrepreneurs above 18 years of age. Greenfield project. Minimum 51% stake must be held by SC/ST/women.',
          category: 'Special Credit Loan',
          benefits: 'Bank loan from Rs. 10 Lakhs up to Rs. 1 Crore covering up to 75% of the project cost, with low interest rates.',
          officialLink: 'https://www.standupmitra.in',
          state: 'All',
          industry: 'All',
          fundingAmount: 10000000,
        },
        {
          name: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
          description: 'Provides credit guarantee to collateral-free loans for MSMEs to encourage lending from financial institutions.',
          eligibility: 'New and existing Micro and Small Enterprises engaged in manufacturing or service activities.',
          category: 'Credit Guarantee',
          benefits: 'Guarantee coverage up to 85% for micro/women/SC/ST enterprises for credit facilities up to Rs. 2 Crore.',
          officialLink: 'https://www.cgtmse.in',
          state: 'All',
          industry: 'All',
          fundingAmount: 20000000,
        },
        {
          name: 'MSME Ideas Hackathon & Incubation',
          description: 'Fosters innovation and design concepts among MSMEs by supporting incubation facilities and project commercialization.',
          eligibility: 'Students, innovators, and registered MSMEs with a viable proof-of-concept idea.',
          category: 'Grants & Incubation',
          benefits: 'Financial assistance up to Rs. 15 Lakhs per approved idea for developing prototype and mentoring support.',
          officialLink: 'https://innovative.msme.gov.in',
          state: 'All',
          industry: 'All',
          fundingAmount: 1500000,
        },
        {
          name: 'Karnataka Elevate Idea2PoC',
          description: 'State-specific grant-in-aid program to help startups build prototypes, access government mentors, and scale solutions.',
          eligibility: 'Startups registered with Startup Cell Karnataka, incorporated less than 4 years, with technology-led innovation.',
          category: 'State Grant',
          benefits: 'Grant-in-aid up to INR 50 Lakhs, free incubation space, and validation support.',
          officialLink: 'https://startup.karnataka.gov.in',
          state: 'Karnataka',
          industry: 'Digital Services',
          fundingAmount: 5000000,
        }
      ];
      await GovernmentScheme.insertMany(schemes);
      console.log('✅ Government schemes seeded');
    } else {
      console.log('ℹ️ Government schemes already exist – skipping');
    }

    // ---- Funding Programs ----
    const fundingCount = await FundingProgram.estimatedDocumentCount();
    if (fundingCount === 0) {
      const fundingPrograms = [
        {
          name: 'SIDBI SMILE Loan Scheme',
          provider: 'Small Industries Development Bank of India (SIDBI)',
          amount: 25000000,
          interestRate: 8.2,
          eligibility: 'New and existing MSMEs in manufacturing/services focusing on key Make in India sectors.',
          industry: 'Manufacturing',
          applicationLink: 'https://www.sidbi.in',
        },
        {
          name: 'SBI Startup Business Loan',
          provider: 'State Bank of India (SBI)',
          amount: 5000000,
          interestRate: 9.5,
          eligibility: 'DPIIT registered startups with a minimum of 1 year of commercial operations.',
          industry: 'All',
          applicationLink: 'https://sbi.co.in',
        },
        {
          name: 'HDFC SmartUp Loans for Startups',
          provider: 'HDFC Bank',
          amount: 15000000,
          interestRate: 10.5,
          eligibility: 'Early-growth and scaling startups with proof of revenue and scaling potential.',
          industry: 'All',
          applicationLink: 'https://www.hdfcbank.com',
        },
        {
          name: 'NABARD Rural Entrepreneurship Scheme',
          provider: 'NABARD',
          amount: 2000000,
          interestRate: 7.5,
          eligibility: 'Youth and entrepreneurs looking to set up agro-processing or rural business units.',
          industry: 'Agriculture',
          applicationLink: 'https://www.nabard.org',
        }
      ];
      await FundingProgram.insertMany(fundingPrograms);
      console.log('✅ Funding programs seeded');
    } else {
      console.log('ℹ️ Funding programs already exist – skipping');
    }

    // ---- Business Ideas, Roadmaps, and Learning Resources ----
    // Must run after skills and interests are seeded (depends on their ObjectIds).
    await seedBusinessData();

    // ---- Sprint 5 Phase 1: named schemes + funding programs ----
    await seedSchemeData();

    // ---- Courses, Modules, Lessons, Quizzes ----
    const Course = require('../models/Course');
    const courseCount = await Course.estimatedDocumentCount();
    if (courseCount === 0) {
      const { seedCoursesInternal } = require('../seeds/courseSeed');
      await seedCoursesInternal();
      console.log('✅ Demo courses seeded');
    } else {
      console.log('ℹ️ Courses already exist – skipping');
    }

  } catch (err) {
    console.error('❌ Seed error:', err);
  }
}

module.exports = { runSeed };

// End of seed script – safe, deterministic, and production‑ready.
