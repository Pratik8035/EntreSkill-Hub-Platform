const BusinessPlan = require('../models/BusinessPlan');
const CostEstimate = require('../models/CostEstimate');
const RevenueProjection = require('../models/RevenueProjection');
const BusinessIdea = require('../models/BusinessIdea');
const UserAssessment = require('../models/UserAssessment');

// Helper to parse dollar ranges like "$500-$1500" and return average number
function parseDollarRange(rangeStr) {
  const matches = rangeStr.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
  if (!matches) return 0;
  const low = parseInt(matches[1].replace(/,/g, ''), 10);
  const high = parseInt(matches[2].replace(/,/g, ''), 10);
  return (low + high) / 2;
}

// Experience level multiplier for cost (higher multiplier for less experienced)
const experienceCostMultiplier = {
  Beginner: 1.2,
  Intermediate: 1.0,
  Experienced: 0.8,
};

// Category base cost map (values are approximate USD)
const categoryEquipmentBase = {
  Technology: 5000,
  Healthcare: 4000,
  Education: 3000,
  Finance: 4500,
  Other: 3500,
};

const difficultyMarketingBase = {
  Beginner: 2000,
  Intermediate: 3000,
  Experienced: 4000,
};

/**
 * Calculates and upserts a CostEstimate document.
 * Uses BusinessIdea fields and UserAssessment experience level to derive realistic costs.
 */
async function calculateStartupCost(businessIdeaId, userId) {
  const idea = await BusinessIdea.findById(businessIdeaId).lean();
  if (!idea) throw new Error('BusinessIdea not found');

  const assessment = await UserAssessment.findOne({ userId }).lean();
  const expLevel = assessment?.experienceLevel || 'Beginner';
  const expMultiplier = experienceCostMultiplier[expLevel] || 1.2;

  const equipmentBase = categoryEquipmentBase[idea.category] || categoryEquipmentBase.Other;
  const equipmentCost = Math.round(equipmentBase * expMultiplier);

  const marketingBase = difficultyMarketingBase[idea.difficultyLevel] || difficultyMarketingBase.Beginner;
  const marketingCost = Math.round(marketingBase * expMultiplier);

  // Operational cost derived from average startup cost range
  const avgStartupRange = parseDollarRange(idea.startupCostRange);
  const operationalCost = Math.round(avgStartupRange * 0.4 * expMultiplier);

  const miscCost = Math.round((equipmentCost + marketingCost + operationalCost) * 0.05);

  const totalCost = equipmentCost + marketingCost + operationalCost + miscCost;

  const costDoc = await CostEstimate.findOneAndUpdate(
    { businessIdeaId },
    { equipmentCost, marketingCost, operationalCost, miscCost, totalCost },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return costDoc;
}

/**
 * Calculates and upserts a RevenueProjection document.
 * Considers estimatedMonthlyIncome from BusinessIdea and experience level.
 */
async function calculateRevenue(businessIdeaId, userId) {
  const idea = await BusinessIdea.findById(businessIdeaId).lean();
  if (!idea) throw new Error('BusinessIdea not found');

  const assessment = await UserAssessment.findOne({ userId }).lean();
  const expLevel = assessment?.experienceLevel || 'Beginner';
  const expMultiplier = experienceCostMultiplier[expLevel] || 1.2;

  const baseIncome = parseInt(idea.estimatedMonthlyIncome.replace(/[^\d]/g, ''), 10) || 0;

  // Adjust income based on experience (more experienced -> higher conversion)
  const monthlyRevenue = Math.round(baseIncome * (expLevel === 'Experienced' ? 1.2 : expLevel === 'Intermediate' ? 1.0 : 0.8));

  // Use previously calculated cost as baseline for expenses
  const cost = await CostEstimate.findOne({ businessIdeaId }).lean();
  const operationalExpense = cost ? Math.round(cost.totalCost / 12) : Math.round(monthlyRevenue * 0.4);

  const monthlyExpense = Math.round(operationalExpense * expMultiplier);
  const monthlyProfit = monthlyRevenue - monthlyExpense;
  const yearlyProfit = monthlyProfit * 12;

  const revDoc = await RevenueProjection.findOneAndUpdate(
    { businessIdeaId },
    { monthlyRevenue, monthlyExpense, monthlyProfit, yearlyProfit },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return revDoc;
}

/**
 * Calculates risk score based on experience, cost, market demand, and competition.
 */
async function calculateRiskScore(userId, businessIdeaId, totalCost, monthlyProfit) {
  const assessment = await UserAssessment.findOne({ userId }).lean();
  const expLevel = assessment?.experienceLevel || 'Beginner';

  const experienceScore = { Beginner: 30, Intermediate: 20, Experienced: 10 }[expLevel];
  const costScore = totalCost > 15000 ? 30 : totalCost > 8000 ? 20 : 10;

  const idea = await BusinessIdea.findById(businessIdeaId).lean();
  // Market demand derived from difficulty level (harder => higher demand)
  const demandScore = { Beginner: 10, Intermediate: 20, Experienced: 30 }[idea?.difficultyLevel] || 20;
  const competitionScore = (idea?.relatedInterests?.length || 1) > 5 ? 30 : 15;

  // Lower total => lower risk.
  const aggregate = experienceScore + costScore + (100 - demandScore) + competitionScore;
  const avg = aggregate / 4;
  if (avg <= 20) return 'Low';
  if (avg <= 35) return 'Medium';
  return 'High';
}

/**
 * Orchestrates full business plan generation.
 */
async function generateBusinessPlan(businessIdeaId, userId) {
  // Ensure cost and revenue are upserted first
  const cost = await calculateStartupCost(businessIdeaId, userId);
  const revenue = await calculateRevenue(businessIdeaId, userId);
  const riskScore = await calculateRiskScore(userId, businessIdeaId, cost.totalCost, revenue.monthlyProfit);

  const idea = await BusinessIdea.findById(businessIdeaId).lean();
  if (!idea) throw new Error('BusinessIdea not found');

  const planData = {
    businessIdeaId,
    executiveSummary: `Business idea "${idea.name}" in the ${idea.category} sector targeting ${idea.difficultyLevel} markets.`,
    targetMarket: `Target customers interested in ${idea.tags?.join(', ') || 'the product'}.`,
    marketingStrategy: `Leverage digital channels and sector‑specific partnerships.`,
    operationsPlan: `Implement milestones from the associated roadmap with required skills.`,
    financialPlan: `Projected startup cost $${cost.totalCost} with expected yearly profit $${revenue.yearlyProfit}.`,
    riskScore,
    costEstimate: cost._id,
    revenueProjection: revenue._id,
  };

  const plan = await BusinessPlan.findOneAndUpdate(
    { businessIdeaId },
    planData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Populate sub‑documents for convenience
  await plan.populate('costEstimate revenueProjection');
  return plan;
}

module.exports = {
  generateBusinessPlan,
  calculateStartupCost,
  calculateRevenue,
  calculateRiskScore,
};
