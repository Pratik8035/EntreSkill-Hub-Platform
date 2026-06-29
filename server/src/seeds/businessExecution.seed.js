// src/seeds/businessExecution.seed.js
// Seed data for Business Execution Tracking — Sprint 8 Phase 1

const mongoose = require('mongoose');
const BusinessGoal = require('../models/BusinessGoal');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const KPI = require('../models/KPI');
const User = require('../models/User');

const seedBusinessExecutionData = async () => {
  try {
    console.log('Starting Business Execution seed...');

    // Get or create a test user
    let user = await User.findOne({ email: 'testuser@entreskill.com' });
    if (!user) {
      user = new User({
        name: 'Test User',
        email: 'testuser@entreskill.com',
        password: 'hashedpassword123',
        role: 'user',
        isVerified: true,
      });
      await user.save();
      console.log('Created test user');
    }

    const userId = user._id;

    // Clear existing data for this user
    await BusinessGoal.deleteMany({ userId });
    await Milestone.deleteMany({});
    await Task.deleteMany({});
    await KPI.deleteMany({ userId });
    console.log('Cleared existing data');

    // Goal 1: Launch Business
    const goal1 = await BusinessGoal.create({
      userId,
      title: 'Launch Business',
      description: 'Successfully launch the business and start operations',
      targetDate: new Date('2026-12-31'),
      status: 'In Progress',
      priority: 'High',
    });
    console.log('Created Goal 1: Launch Business');

    const milestone1_1 = await Milestone.create({
      goalId: goal1._id,
      title: 'Business Registration',
      description: 'Complete all legal registration requirements',
      targetDate: new Date('2026-08-31'),
      completed: true,
      completedAt: new Date('2026-08-15'),
    });

    const milestone1_2 = await Milestone.create({
      goalId: goal1._id,
      title: 'Product Development',
      description: 'Develop and finalize the core product',
      targetDate: new Date('2026-10-31'),
      completed: false,
    });

    const milestone1_3 = await Milestone.create({
      goalId: goal1._id,
      title: 'Website Launch',
      description: 'Launch the business website',
      targetDate: new Date('2026-11-30'),
      completed: false,
    });

    await Task.create({
      milestoneId: milestone1_1._id,
      title: 'Register with local authorities',
      description: 'Submit registration documents to local business authority',
      dueDate: new Date('2026-07-31'),
      status: 'Completed',
      completedAt: new Date('2026-07-20'),
    });

    await Task.create({
      milestoneId: milestone1_1._id,
      title: 'Obtain tax ID',
      description: 'Get tax identification number from government',
      dueDate: new Date('2026-08-15'),
      status: 'Completed',
      completedAt: new Date('2026-08-10'),
    });

    await Task.create({
      milestoneId: milestone1_2._id,
      title: 'Design product prototype',
      description: 'Create initial product design and prototype',
      dueDate: new Date('2026-09-30'),
      status: 'In Progress',
    });

    await Task.create({
      milestoneId: milestone1_2._id,
      title: 'Develop MVP',
      description: 'Build minimum viable product',
      dueDate: new Date('2026-10-31'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone1_3._id,
      title: 'Design website',
      description: 'Create website design and layout',
      dueDate: new Date('2026-11-15'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone1_3._id,
      title: 'Deploy website',
      description: 'Deploy website to production server',
      dueDate: new Date('2026-11-30'),
      status: 'Pending',
    });

    console.log('Created milestones and tasks for Goal 1');

    // Goal 2: Get First Customer
    const goal2 = await BusinessGoal.create({
      userId,
      title: 'Get First Customer',
      description: 'Acquire the first paying customer for the business',
      targetDate: new Date('2027-01-31'),
      status: 'Not Started',
      priority: 'High',
    });
    console.log('Created Goal 2: Get First Customer');

    const milestone2_1 = await Milestone.create({
      goalId: goal2._id,
      title: 'Marketing Campaign',
      description: 'Launch marketing campaign to attract customers',
      targetDate: new Date('2026-12-31'),
      completed: false,
    });

    const milestone2_2 = await Milestone.create({
      goalId: goal2._id,
      title: 'Sales Outreach',
      description: 'Reach out to potential customers',
      targetDate: new Date('2027-01-15'),
      completed: false,
    });

    const milestone2_3 = await Milestone.create({
      goalId: goal2._id,
      title: 'Close First Sale',
      description: 'Complete first sale transaction',
      targetDate: new Date('2027-01-31'),
      completed: false,
    });

    await Task.create({
      milestoneId: milestone2_1._id,
      title: 'Create marketing materials',
      description: 'Design and create marketing collateral',
      dueDate: new Date('2026-12-15'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone2_1._id,
      title: 'Run social media ads',
      description: 'Launch advertising campaign on social platforms',
      dueDate: new Date('2026-12-31'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone2_2._id,
      title: 'Identify prospects',
      description: 'Build list of potential customers',
      dueDate: new Date('2027-01-07'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone2_2._id,
      title: 'Send outreach emails',
      description: 'Contact potential customers via email',
      dueDate: new Date('2027-01-15'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone2_3._id,
      title: 'Negotiate deal',
      description: 'Negotiate terms with interested customer',
      dueDate: new Date('2027-01-25'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone2_3._id,
      title: 'Finalize contract',
      description: 'Complete contract and receive payment',
      dueDate: new Date('2027-01-31'),
      status: 'Pending',
    });

    console.log('Created milestones and tasks for Goal 2');

    // Goal 3: Reach ₹1,00,000 Revenue
    const goal3 = await BusinessGoal.create({
      userId,
      title: 'Reach ₹1,00,000 Revenue',
      description: 'Achieve total revenue of ₹1,00,000',
      targetDate: new Date('2027-06-30'),
      status: 'Not Started',
      priority: 'Medium',
    });
    console.log('Created Goal 3: Reach ₹1,00,000 Revenue');

    const milestone3_1 = await Milestone.create({
      goalId: goal3._id,
      title: 'Reach ₹25,000 Revenue',
      description: 'Achieve first revenue milestone',
      targetDate: new Date('2027-02-28'),
      completed: false,
    });

    const milestone3_2 = await Milestone.create({
      goalId: goal3._id,
      title: 'Reach ₹50,000 Revenue',
      description: 'Achieve half of revenue target',
      targetDate: new Date('2027-04-30'),
      completed: false,
    });

    const milestone3_3 = await Milestone.create({
      goalId: goal3._id,
      title: 'Reach ₹1,00,000 Revenue',
      description: 'Achieve full revenue target',
      targetDate: new Date('2027-06-30'),
      completed: false,
    });

    await Task.create({
      milestoneId: milestone3_1._id,
      title: 'Increase customer base',
      description: 'Acquire 10 paying customers',
      dueDate: new Date('2027-02-15'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone3_1._id,
      title: 'Optimize pricing',
      description: 'Review and adjust pricing strategy',
      dueDate: new Date('2027-02-28'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone3_2._id,
      title: 'Launch referral program',
      description: 'Implement customer referral incentives',
      dueDate: new Date('2027-04-15'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone3_2._id,
      title: 'Expand marketing channels',
      description: 'Add new marketing channels',
      dueDate: new Date('2027-04-30'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone3_3._id,
      title: 'Scale operations',
      description: 'Scale business operations to handle increased demand',
      dueDate: new Date('2027-06-15'),
      status: 'Pending',
    });

    await Task.create({
      milestoneId: milestone3_3._id,
      title: 'Review and optimize',
      description: 'Review performance and optimize for growth',
      dueDate: new Date('2027-06-30'),
      status: 'Pending',
    });

    console.log('Created milestones and tasks for Goal 3');

    // Create KPIs
    await KPI.create({
      userId,
      name: 'Monthly Revenue',
      targetValue: 20000,
      currentValue: 5000,
      unit: '₹',
    });

    await KPI.create({
      userId,
      name: 'Number of Customers',
      targetValue: 50,
      currentValue: 12,
      unit: 'customers',
    });

    await KPI.create({
      userId,
      name: 'Customer Satisfaction',
      targetValue: 90,
      currentValue: 85,
      unit: '%',
    });

    await KPI.create({
      userId,
      name: 'Conversion Rate',
      targetValue: 10,
      currentValue: 5,
      unit: '%',
    });

    console.log('Created KPIs');

    console.log('Business Execution seed completed successfully!');
    console.log(`Created 3 goals, 9 milestones, 18 tasks, and 4 KPIs`);
  } catch (error) {
    console.error('Error seeding Business Execution data:', error);
    throw error;
  }
};

// Run seed if called directly
if (require.main === module) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/entreskill-hub-test';
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedBusinessExecutionData();
    })
    .then(() => {
      console.log('Seed completed');
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      mongoose.disconnect();
      process.exit(1);
    });
}

module.exports = seedBusinessExecutionData;
