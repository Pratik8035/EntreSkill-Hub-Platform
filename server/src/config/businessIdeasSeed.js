// server/src/config/businessIdeasSeed.js
// CommonJS seed for BusinessIdea, Roadmap, and LearningResource collections.
// Resolves Skill/Interest references by name lookup after those collections are seeded.
// Safe: only inserts when collection is empty (idempotent).

'use strict';

const BusinessIdea = require('../models/BusinessIdea');
const Roadmap = require('../models/Roadmap');
const LearningResource = require('../models/LearningResource');
const Skill = require('../models/Skill');
const Interest = require('../models/Interest');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Build a map of skill name → ObjectId from the already-seeded Skill collection. */
async function buildSkillMap() {
  const skills = await Skill.find({}).lean();
  const map = {};
  skills.forEach((s) => { map[s.name] = s._id; });
  return map;
}

/** Build a map of interest name → ObjectId from the already-seeded Interest collection. */
async function buildInterestMap() {
  const interests = await Interest.find({}).lean();
  const map = {};
  interests.forEach((i) => { map[i.name] = i._id; });
  return map;
}

// ─── Business Idea definitions (skill/interest names resolved at seed-time) ──

const IDEA_DEFS = [
  {
    name: 'Boutique Tailoring & Alterations',
    description: 'Custom dressmaking, alterations, and on-demand tailoring for local clients. Low startup cost with immediate community demand.',
    category: 'Tailoring & Fashion',
    difficultyLevel: 'Beginner',
    startupCostRange: '$300-$800',
    estimatedMonthlyIncome: '$1500',
    skillNames: ['Custom Dressmaking', 'Alterations'],
    skillWeights: [3, 2],
    interestNames: ['Lean Business Models'],
    interestWeights: [4],
    tags: ['sewing', 'fashion', 'custom'],
    roadmapAvailable: true,
  },
  {
    name: 'Hand-Embroidered Accessories',
    description: 'Create embroidered scarves, tote bags, and decorative pieces sold through local markets and online platforms.',
    category: 'Tailoring & Fashion',
    difficultyLevel: 'Intermediate',
    startupCostRange: '$500-$1200',
    estimatedMonthlyIncome: '$2000',
    skillNames: ['Embroidery', 'Fashion Consulting'],
    skillWeights: [3, 1],
    interestNames: ['Artisan Marketplaces'],
    interestWeights: [4],
    tags: ['embroidery', 'handmade', 'accessories'],
    roadmapAvailable: true,
  },
  {
    name: 'Home-Based Catering Service',
    description: 'Prepare catering packages for small events, birthdays, and corporate lunches from a registered home kitchen.',
    category: 'Food & Catering',
    difficultyLevel: 'Beginner',
    startupCostRange: '$400-$1000',
    estimatedMonthlyIncome: '$1800',
    skillNames: ['Home Catering', 'Meal Planning'],
    skillWeights: [3, 2],
    interestNames: ['Startup Funding', 'Local Partnerships'],
    interestWeights: [3, 2],
    tags: ['catering', 'homecooking', 'events'],
    roadmapAvailable: true,
  },
  {
    name: 'Specialty Vegan Bakery',
    description: 'Bake vegan pastries, cupcakes, and custom celebration cakes for health-conscious and dietary-restricted customers.',
    category: 'Food & Catering',
    difficultyLevel: 'Intermediate',
    startupCostRange: '$800-$1500',
    estimatedMonthlyIncome: '$2500',
    skillNames: ['Bakery Products', 'Specialty Catering'],
    skillWeights: [3, 2],
    interestNames: ['Eco-friendly Materials', 'E-commerce Platforms'],
    interestWeights: [3, 2],
    tags: ['vegan', 'bakery', 'healthy'],
    roadmapAvailable: true,
  },
  {
    name: 'Mobile Massage Therapy',
    description: 'Offer on-site therapeutic massages at homes, hotels, and corporate offices with flexible scheduling.',
    category: 'Beauty & Wellness',
    difficultyLevel: 'Beginner',
    startupCostRange: '$200-$600',
    estimatedMonthlyIncome: '$1200',
    skillNames: ['Massage Therapy', 'Wellness Coaching'],
    skillWeights: [4, 1],
    interestNames: ['Local Partnerships'],
    interestWeights: [3],
    tags: ['massage', 'wellness', 'mobile'],
    roadmapAvailable: true,
  },
  {
    name: 'Home Beauty Studio',
    description: 'Provide makeup, hair styling, and facial treatments from a home studio setup for weddings and events.',
    category: 'Beauty & Wellness',
    difficultyLevel: 'Beginner',
    startupCostRange: '$500-$1200',
    estimatedMonthlyIncome: '$1500',
    skillNames: ['Makeup Artistry', 'Hair Styling', 'Facial Treatments'],
    skillWeights: [3, 3, 2],
    interestNames: ['Startup Funding'],
    interestWeights: [2],
    tags: ['beauty', 'salon', 'events'],
    roadmapAvailable: true,
  },
  {
    name: 'Urban Hydroponic Greens',
    description: 'Grow leafy greens, herbs, and microgreens using hydroponics and supply to local restaurants and households.',
    category: 'Agriculture',
    difficultyLevel: 'Intermediate',
    startupCostRange: '$1000-$2000',
    estimatedMonthlyIncome: '$3000',
    skillNames: ['Organic Farming', 'Urban Gardening'],
    skillWeights: [3, 2],
    interestNames: ['Circular Economy', 'Eco-friendly Materials'],
    interestWeights: [4, 3],
    tags: ['hydroponics', 'organic', 'greens'],
    roadmapAvailable: true,
  },
  {
    name: 'Freelance Web Development Agency',
    description: 'Build and maintain websites, landing pages, and e-commerce stores for local small and medium businesses.',
    category: 'Digital Services',
    difficultyLevel: 'Intermediate',
    startupCostRange: '$500-$1500',
    estimatedMonthlyIncome: '$2500',
    skillNames: ['Web Development', 'Digital Marketing'],
    skillWeights: [4, 2],
    interestNames: ['Digital Transformation', 'E-commerce Platforms'],
    interestWeights: [4, 3],
    tags: ['web', 'development', 'freelance'],
    roadmapAvailable: true,
  },
  {
    name: 'Handmade Craft Marketplace Booth',
    description: 'Sell hand-crafted wooden decor, pottery, and jewellery through local weekend markets and online storefronts.',
    category: 'Retail & Trading',
    difficultyLevel: 'Beginner',
    startupCostRange: '$300-$700',
    estimatedMonthlyIncome: '$900',
    skillNames: ['Woodwork', 'Jewellery Making', 'Pottery'],
    skillWeights: [2, 2, 1],
    interestNames: ['Artisan Marketplaces', 'Cultural Events'],
    interestWeights: [5, 3],
    tags: ['handicraft', 'market', 'retail'],
    roadmapAvailable: true,
  },
  {
    name: 'Residential Cleaning Service',
    description: 'Provide regular apartment and house cleaning packages with flexible scheduling for working families.',
    category: 'Home Services',
    difficultyLevel: 'Beginner',
    startupCostRange: '$200-$500',
    estimatedMonthlyIncome: '$1300',
    skillNames: ['House Cleaning'],
    skillWeights: [3],
    interestNames: ['Local Partnerships', 'Skill Sharing Networks'],
    interestWeights: [2, 2],
    tags: ['cleaning', 'home', 'service'],
    roadmapAvailable: true,
  },
  {
    name: 'Electronics Repair Shop',
    description: 'Repair smartphones, laptops, and home electronics with quick turnaround for residential and commercial clients.',
    category: 'Repair Services',
    difficultyLevel: 'Intermediate',
    startupCostRange: '$800-$2000',
    estimatedMonthlyIncome: '$2000',
    skillNames: ['Electronics Repair', 'Appliance Repair'],
    skillWeights: [4, 2],
    interestNames: ['Digital Transformation'],
    interestWeights: [2],
    tags: ['electronics', 'repair', 'mobile'],
    roadmapAvailable: true,
  },
  {
    name: 'Language Tutoring Practice',
    description: 'Offer private English, Hindi, and regional language lessons for school students and working professionals.',
    category: 'Education & Training',
    difficultyLevel: 'Beginner',
    startupCostRange: '$100-$300',
    estimatedMonthlyIncome: '$800',
    skillNames: ['Language Tutoring', 'Exam Preparation'],
    skillWeights: [3, 2],
    interestNames: ['Skill Sharing Networks'],
    interestWeights: [4],
    tags: ['tutoring', 'language', 'education'],
    roadmapAvailable: true,
  },
];


// ─── Roadmap definitions (keyed by idea name) ────────────────────────────────

const ROADMAP_DEFS = {
  'Boutique Tailoring & Alterations': {
    timeline: '3 months',
    milestones: [
      { title: 'Set Up Workspace', description: 'Source sewing machine, iron, and basic tailoring tools. Designate a dedicated workspace at home or a rented stall.', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { title: 'Build a Portfolio', description: 'Complete 5 complimentary alterations or dresses for friends and family. Photograph all finished work for a portfolio.', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { title: 'Register & Price Services', description: 'Register as a local micro-business. Create a standard price list for alterations, hemming, and custom dressmaking.', dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
      { title: 'Launch & Market Locally', description: 'Share portfolio on WhatsApp groups, post in local Facebook community groups, and distribute flyers in nearby apartments.', dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
      { title: 'First 10 Paid Clients', description: 'Close first 10 paid orders. Collect reviews and referrals. Begin tracking monthly income and expenses.', dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
    ],
    mentorCategories: ['Fashion & Textiles', 'Business Basics'],
    requiredSkillNames: ['Custom Dressmaking', 'Alterations'],
    missingSkillNames: ['Pattern Making', 'Fashion Consulting'],
  },
  'Home-Based Catering Service': {
    timeline: '2 months',
    milestones: [
      { title: 'Obtain FSSAI Registration', description: 'Apply for Food Safety and Standards Authority of India (FSSAI) basic registration for your home kitchen.', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { title: 'Develop Menu & Pricing', description: 'Finalise a core menu of 5-8 dishes. Calculate cost per serving and set competitive prices with a 30% margin.', dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) },
      { title: 'Trial Events', description: 'Cater for 2-3 small family gatherings or office tiffin orders at cost price to refine portions, packaging, and timing.', dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
      { title: 'Build Online Presence', description: 'Create a WhatsApp Business profile and an Instagram page with food photos. Register on Swiggy/Zomato home kitchen program.', dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
    ],
    mentorCategories: ['Food & Catering', 'Business Basics', 'Marketing'],
    requiredSkillNames: ['Home Catering', 'Meal Planning'],
    missingSkillNames: ['Specialty Catering'],
  },
  'Mobile Massage Therapy': {
    timeline: '2 months',
    milestones: [
      { title: 'Certification & Equipment', description: 'Obtain a recognized massage therapy certificate if not already held. Purchase portable massage table, oils, and kit.', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) },
      { title: 'Define Service Menu', description: 'List services (Swedish, deep tissue, sports), duration options (60/90 min), and pricing. Create a booking process.', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { title: 'First 10 Clients', description: 'Offer introductory 20% discount to first 10 bookings. Collect reviews for Google Business profile.', dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
    ],
    mentorCategories: ['Health & Wellness', 'Business Basics'],
    requiredSkillNames: ['Massage Therapy'],
    missingSkillNames: ['Wellness Coaching'],
  },
  'Freelance Web Development Agency': {
    timeline: '4 months',
    milestones: [
      { title: 'Define Service Stack', description: 'Decide on your core stack (React/Node or WordPress). Create 2 portfolio demo sites covering different industries.', dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) },
      { title: 'Register on Freelance Platforms', description: 'Create profiles on Fiverr, Upwork, and Freelancer. Optimise profile with portfolio links and skill tests.', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { title: 'Land First 3 Clients', description: 'Win 3 projects (even at lower rates) to build reviews. Deliver on time and document testimonials.', dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000) },
      { title: 'Set Up Agency Structure', description: 'Register business entity, open a business bank account, and draft standard client contracts and project scopes.', dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
      { title: 'Recurring Revenue Goal', description: 'Establish 2 retainer clients for monthly maintenance. Target ₹30,000/month recurring income.', dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) },
    ],
    mentorCategories: ['Digital Services', 'Business Development', 'Marketing'],
    requiredSkillNames: ['Web Development', 'Digital Marketing'],
    missingSkillNames: ['App Development', 'Content Writing'],
  },
  'Residential Cleaning Service': {
    timeline: '6 weeks',
    milestones: [
      { title: 'Source Supplies & Equipment', description: 'Buy a starter kit: mop, vacuum, cleaning agents, microfiber cloths, gloves. Total budget under ₹5,000.', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { title: 'Set Pricing Packages', description: 'Define 3 packages: One-time deep clean, weekly, and bi-weekly. Price by apartment size (1BHK, 2BHK, 3BHK).', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { title: 'First 5 Bookings', description: 'Offer free first-time clean to 3 neighbours to get reviews. Post in housing society WhatsApp groups.', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { title: 'Build Subscriber Base', description: 'Convert trial clients to monthly subscribers. Target 8 recurring monthly clients for stable income.', dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000) },
    ],
    mentorCategories: ['Home Services', 'Business Basics'],
    requiredSkillNames: ['House Cleaning'],
    missingSkillNames: ['Interior Decorating'],
  },
};


// ─── Learning Resource definitions (keyed by idea name) ──────────────────────

const RESOURCE_DEFS = {
  'Boutique Tailoring & Alterations': [
    { title: 'Sewing Basics for Beginners — Craftsy', url: 'https://www.craftsy.com/sewing', type: 'Course', skillNames: ['Custom Dressmaking'] },
    { title: 'How to Start a Tailoring Business from Home', url: 'https://www.wikihow.com/Start-a-Tailoring-Business', type: 'Article', skillNames: ['Custom Dressmaking', 'Alterations'] },
    { title: 'Garment Alterations Masterclass — YouTube', url: 'https://www.youtube.com/results?search_query=garment+alterations+masterclass', type: 'Video', skillNames: ['Alterations'] },
  ],
  'Home-Based Catering Service': [
    { title: 'FSSAI Registration Guide for Home Kitchens', url: 'https://foscos.fssai.gov.in', type: 'Article', skillNames: ['Home Catering'] },
    { title: 'Catering Business: Pricing & Menu Planning', url: 'https://www.youtube.com/results?search_query=catering+business+pricing+menu', type: 'Video', skillNames: ['Home Catering', 'Meal Planning'] },
    { title: 'Food Safety Basics for Home Cooks — FSSAI', url: 'https://www.fssai.gov.in/home/fssai-initiatives/fostac.html', type: 'Course', skillNames: ['Specialty Catering'] },
  ],
  'Specialty Vegan Bakery': [
    { title: 'Vegan Baking Fundamentals — Udemy', url: 'https://www.udemy.com/topic/baking/', type: 'Course', skillNames: ['Bakery Products'] },
    { title: 'How to Start a Bakery Business in India', url: 'https://www.startupindia.gov.in', type: 'Article', skillNames: ['Bakery Products'] },
    { title: 'Plant-Based Pastry Techniques — YouTube', url: 'https://www.youtube.com/results?search_query=vegan+pastry+techniques', type: 'Video', skillNames: ['Bakery Products'] },
  ],
  'Mobile Massage Therapy': [
    { title: 'Massage Therapy Certification India — ICMT', url: 'https://www.icmtindia.com', type: 'Course', skillNames: ['Massage Therapy'] },
    { title: 'How to Start a Mobile Massage Business', url: 'https://www.nerdwallet.com/article/small-business/how-to-start-massage-therapy-business', type: 'Article', skillNames: ['Massage Therapy'] },
    { title: 'Swedish Massage Step-by-Step Tutorial', url: 'https://www.youtube.com/results?search_query=swedish+massage+tutorial', type: 'Video', skillNames: ['Massage Therapy'] },
  ],
  'Home Beauty Studio': [
    { title: 'Professional Makeup Artistry Course — Lakmé Academy', url: 'https://www.lakshmiacademy.com', type: 'Course', skillNames: ['Makeup Artistry'] },
    { title: 'Hair Styling Techniques for Beginners', url: 'https://www.youtube.com/results?search_query=hair+styling+techniques+beginners', type: 'Video', skillNames: ['Hair Styling'] },
    { title: 'Starting a Home Beauty Salon in India — Business Guide', url: 'https://www.smallbusiness.in/start-a-salon', type: 'Article', skillNames: ['Facial Treatments'] },
  ],
  'Urban Hydroponic Greens': [
    { title: 'Hydroponics for Beginners — Complete Guide', url: 'https://www.epicgardening.com/hydroponic-growing', type: 'Article', skillNames: ['Organic Farming'] },
    { title: 'Urban Farming Setup Tutorial — YouTube', url: 'https://www.youtube.com/results?search_query=urban+hydroponic+farm+setup', type: 'Video', skillNames: ['Urban Gardening'] },
    { title: 'Sustainable Urban Agriculture — Coursera', url: 'https://www.coursera.org/learn/sustainable-food-systems', type: 'Course', skillNames: ['Organic Farming'] },
  ],
  'Freelance Web Development Agency': [
    { title: 'The Odin Project — Free Full-Stack Curriculum', url: 'https://www.theodinproject.com', type: 'Course', skillNames: ['Web Development'] },
    { title: 'How to Get Web Dev Clients as a Freelancer', url: 'https://www.youtube.com/results?search_query=how+to+get+web+development+clients', type: 'Video', skillNames: ['Web Development'] },
    { title: 'SEO & Digital Marketing Fundamentals — Google', url: 'https://learndigital.withgoogle.com/digitalgarage', type: 'Course', skillNames: ['Digital Marketing'] },
    { title: 'Freelance Contract Templates for Developers', url: 'https://www.hellobonsai.com/freelance-contract', type: 'Article', skillNames: ['Web Development'] },
  ],
  'Handmade Craft Marketplace Booth': [
    { title: 'Woodworking for Beginners — YouTube Series', url: 'https://www.youtube.com/results?search_query=woodworking+for+beginners', type: 'Video', skillNames: ['Woodwork'] },
    { title: 'Selling Handmade Products on Etsy/Amazon Handmade', url: 'https://www.etsy.com/sell', type: 'Article', skillNames: ['Woodwork', 'Jewellery Making'] },
    { title: 'Jewellery Making at Home — Beginner Course', url: 'https://www.youtube.com/results?search_query=jewellery+making+at+home+beginners', type: 'Video', skillNames: ['Jewellery Making'] },
  ],
  'Residential Cleaning Service': [
    { title: 'How to Start a Cleaning Business — Startup Guide', url: 'https://www.nerdwallet.com/article/small-business/cleaning-business', type: 'Article', skillNames: ['House Cleaning'] },
    { title: 'Professional House Cleaning Tips & Techniques', url: 'https://www.youtube.com/results?search_query=professional+house+cleaning+techniques', type: 'Video', skillNames: ['House Cleaning'] },
    { title: 'Pricing Your Cleaning Business Correctly', url: 'https://www.jobber.com/academy/cleaning-business-prices', type: 'Article', skillNames: ['House Cleaning'] },
  ],
  'Electronics Repair Shop': [
    { title: 'Mobile Phone Repair Course — YouTube', url: 'https://www.youtube.com/results?search_query=mobile+phone+repair+course', type: 'Video', skillNames: ['Electronics Repair'] },
    { title: 'Starting an Electronics Repair Business in India', url: 'https://www.startupindia.gov.in/content/sih/en/startupgov/repair-service.html', type: 'Article', skillNames: ['Electronics Repair'] },
    { title: 'Laptop Repair Fundamentals — Udemy', url: 'https://www.udemy.com/topic/computer-hardware/', type: 'Course', skillNames: ['Electronics Repair', 'Appliance Repair'] },
  ],
  'Language Tutoring Practice': [
    { title: 'English Grammar & Communication — Coursera', url: 'https://www.coursera.org/learn/english-for-business', type: 'Course', skillNames: ['Language Tutoring'] },
    { title: 'How to Start a Tutoring Business from Home', url: 'https://www.tutor.com/resources/starting-tutoring-business', type: 'Article', skillNames: ['Language Tutoring'] },
    { title: 'Effective Teaching Techniques for Private Tutors', url: 'https://www.youtube.com/results?search_query=private+tutoring+techniques', type: 'Video', skillNames: ['Language Tutoring', 'Exam Preparation'] },
  ],
};


// ─── Seed functions ───────────────────────────────────────────────────────────

/**
 * Seed BusinessIdea collection.
 * Resolves Skill/Interest ObjectIds by name before inserting.
 */
async function seedBusinessIdeas(skillMap, interestMap) {
  const count = await BusinessIdea.estimatedDocumentCount();
  if (count > 0) {
    console.log('ℹ️  Business ideas already exist — skipping');
    return;
  }

  const docs = IDEA_DEFS.map((def) => {
    const requiredSkills = def.skillNames.map((name, i) => {
      const skillId = skillMap[name];
      if (!skillId) console.warn(`  ⚠️  Skill not found in DB: "${name}" (idea: ${def.name})`);
      return { skillId: skillId || null, weight: def.skillWeights[i] };
    }).filter((rs) => rs.skillId !== null);

    const relatedInterests = def.interestNames.map((name, i) => {
      const interestId = interestMap[name];
      if (!interestId) console.warn(`  ⚠️  Interest not found in DB: "${name}" (idea: ${def.name})`);
      return { interestId: interestId || null, weight: def.interestWeights[i] };
    }).filter((ri) => ri.interestId !== null);

    return {
      name: def.name,
      description: def.description,
      category: def.category,
      difficultyLevel: def.difficultyLevel,
      startupCostRange: def.startupCostRange,
      estimatedMonthlyIncome: def.estimatedMonthlyIncome,
      requiredSkills,
      relatedInterests,
      tags: def.tags,
      roadmapAvailable: def.roadmapAvailable,
      isActive: true,
    };
  });

  await BusinessIdea.insertMany(docs);
  console.log(`✅ Business ideas seeded (${docs.length} ideas)`);
}

/**
 * Seed Roadmap collection.
 * Looks up BusinessIdea and Skill ObjectIds by name.
 */
async function seedRoadmaps(skillMap) {
  const count = await Roadmap.estimatedDocumentCount();
  if (count > 0) {
    console.log('ℹ️  Roadmaps already exist — skipping');
    return;
  }

  const roadmapDocs = [];

  for (const [ideaName, def] of Object.entries(ROADMAP_DEFS)) {
    const idea = await BusinessIdea.findOne({ name: ideaName }).lean();
    if (!idea) {
      console.warn(`  ⚠️  BusinessIdea not found for roadmap: "${ideaName}"`);
      continue;
    }

    const requiredSkills = (def.requiredSkillNames || [])
      .map((name) => ({ skillId: skillMap[name] || null, weight: 2 }))
      .filter((e) => e.skillId !== null);

    const missingSkills = (def.missingSkillNames || [])
      .map((name) => ({ skillId: skillMap[name] || null, weight: 1 }))
      .filter((e) => e.skillId !== null);

    roadmapDocs.push({
      businessIdeaId: idea._id,
      milestones: def.milestones,
      timeline: def.timeline,
      requiredSkills,
      missingSkills,
      mentorCategories: def.mentorCategories,
    });
  }

  if (roadmapDocs.length > 0) {
    await Roadmap.insertMany(roadmapDocs);
  }
  console.log(`✅ Roadmaps seeded (${roadmapDocs.length} roadmaps)`);
}

/**
 * Seed LearningResource collection.
 * Looks up BusinessIdea and Skill ObjectIds by name.
 */
async function seedLearningResources(skillMap) {
  const count = await LearningResource.estimatedDocumentCount();
  if (count > 0) {
    console.log('ℹ️  Learning resources already exist — skipping');
    return;
  }

  const resourceDocs = [];

  for (const [ideaName, resources] of Object.entries(RESOURCE_DEFS)) {
    const idea = await BusinessIdea.findOne({ name: ideaName }).lean();
    if (!idea) {
      console.warn(`  ⚠️  BusinessIdea not found for resources: "${ideaName}"`);
      continue;
    }

    for (const r of resources) {
      const relatedSkillIds = (r.skillNames || [])
        .map((name) => skillMap[name])
        .filter(Boolean);

      resourceDocs.push({
        businessIdeaId: idea._id,
        title: r.title,
        url: r.url,
        type: r.type,
        relatedSkillIds,
      });
    }
  }

  if (resourceDocs.length > 0) {
    await LearningResource.insertMany(resourceDocs);
  }
  console.log(`✅ Learning resources seeded (${resourceDocs.length} resources)`);
}

/**
 * Main entry point — call this from seed.js after skills/interests are seeded.
 */
async function seedBusinessData() {
  const skillMap = await buildSkillMap();
  const interestMap = await buildInterestMap();

  if (Object.keys(skillMap).length === 0) {
    console.error('❌ Skill collection is empty. Run skill seed first before seeding business ideas.');
    return;
  }

  await seedBusinessIdeas(skillMap, interestMap);
  // Roadmaps and resources depend on BusinessIdea documents existing
  await seedRoadmaps(skillMap);
  await seedLearningResources(skillMap);
}

module.exports = { seedBusinessData };
