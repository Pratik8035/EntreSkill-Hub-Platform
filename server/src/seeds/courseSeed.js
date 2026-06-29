const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
require('dotenv').config();

/**
 * Seed data for Learning Platform - Sprint 7 Phase 1
 * Creates 5 sample courses with modules, lessons, and quizzes
 */

const seedCoursesInternal = async () => {
  try {
    // Clear existing data
    await Quiz.deleteMany({});
  await Lesson.deleteMany({});
  await Module.deleteMany({});
  await Course.deleteMany({});
  console.log('Cleared existing course data');

  // Course 1: Entrepreneurship Basics
    const course1 = await Course.create({
      title: 'Entrepreneurship Basics',
      description: 'Learn the fundamentals of starting and running your own business. This course covers essential concepts every entrepreneur should know.',
      category: 'Entrepreneurship',
      difficultyLevel: 'Beginner',
      thumbnail: 'https://example.com/thumbnails/entrepreneurship.jpg',
      estimatedDuration: 180,
      isPublished: true,
    });

    const module1_1 = await Module.create({
      courseId: course1._id,
      title: 'Introduction to Entrepreneurship',
      description: 'Understanding what it means to be an entrepreneur',
      order: 1,
    });

    const lesson1_1_1 = await Lesson.create({
      moduleId: module1_1._id,
      title: 'What is Entrepreneurship?',
      content: 'Entrepreneurship is the process of designing, launching, and running a new business. It involves identifying opportunities, taking risks, and creating value in the market.',
      videoUrl: 'https://example.com/videos/entrepreneurship-intro.mp4',
      duration: 15,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson1_1_1._id,
      title: 'Entrepreneurship Basics Quiz',
      questions: [
        {
          question: 'What is the primary goal of entrepreneurship?',
          options: ['Creating value in the market', 'Minimizing all risks', 'Working alone only', 'Avoiding innovation'],
          correctAnswer: 0,
        },
        {
          question: 'Which of these is NOT a characteristic of successful entrepreneurs?',
          options: ['Risk-taking', 'Innovation', 'Fear of failure', 'Persistence'],
          correctAnswer: 2,
        },
      ],
    });

    const module1_2 = await Module.create({
      courseId: course1._id,
      title: 'Identifying Business Opportunities',
      description: 'Learn how to spot and validate business ideas',
      order: 2,
    });

    const lesson1_2_1 = await Lesson.create({
      moduleId: module1_2._id,
      title: 'Market Research Basics',
      content: 'Market research helps you understand your target audience, competition, and market trends. It is essential for validating your business idea.',
      videoUrl: 'https://example.com/videos/market-research.mp4',
      duration: 20,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson1_2_1._id,
      title: 'Market Research Quiz',
      questions: [
        {
          question: 'What is the primary purpose of market research?',
          options: ['To copy competitors', 'To understand customers and market', 'To increase costs', 'To delay product launch'],
          correctAnswer: 1,
        },
      ],
    });

    // Course 2: Business Planning
    const course2 = await Course.create({
      title: 'Business Planning',
      description: 'Master the art of creating comprehensive business plans that attract investors and guide your growth.',
      category: 'Business Planning',
      difficultyLevel: 'Intermediate',
      thumbnail: 'https://example.com/thumbnails/business-planning.jpg',
      estimatedDuration: 240,
      isPublished: true,
    });

    const module2_1 = await Module.create({
      courseId: course2._id,
      title: 'Business Plan Fundamentals',
      description: 'Understanding the components of a solid business plan',
      order: 1,
    });

    const lesson2_1_1 = await Lesson.create({
      moduleId: module2_1._id,
      title: 'Executive Summary',
      content: 'The executive summary is the most important section of your business plan. It provides a concise overview of your entire plan and should capture the reader\'s attention.',
      videoUrl: 'https://example.com/videos/executive-summary.mp4',
      duration: 25,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson2_1_1._id,
      title: 'Executive Summary Quiz',
      questions: [
        {
          question: 'Where should the executive summary be placed in a business plan?',
          options: ['At the end', 'In the middle', 'At the beginning', 'In an appendix'],
          correctAnswer: 2,
        },
        {
          question: 'What is the ideal length of an executive summary?',
          options: ['1-2 pages', '10 pages', '20 pages', '50 pages'],
          correctAnswer: 0,
        },
      ],
    });

    const module2_2 = await Module.create({
      courseId: course2._id,
      title: 'Financial Projections',
      description: 'Learn to create realistic financial forecasts',
      order: 2,
    });

    const lesson2_2_1 = await Lesson.create({
      moduleId: module2_2._id,
      title: 'Revenue Models',
      content: 'A revenue model describes how your business will generate income. Common models include subscription, freemium, advertising, and transaction-based models.',
      videoUrl: 'https://example.com/videos/revenue-models.mp4',
      duration: 30,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson2_2_1._id,
      title: 'Revenue Models Quiz',
      questions: [
        {
          question: 'Which revenue model charges users a recurring fee?',
          options: ['One-time purchase', 'Subscription', 'Advertising', 'Freemium'],
          correctAnswer: 1,
        },
      ],
    });

    // Course 3: Digital Marketing
    const course3 = await Course.create({
      title: 'Digital Marketing',
      description: 'Learn essential digital marketing strategies to grow your online presence and reach more customers.',
      category: 'Digital Marketing',
      difficultyLevel: 'Beginner',
      thumbnail: 'https://example.com/thumbnails/digital-marketing.jpg',
      estimatedDuration: 200,
      isPublished: true,
    });

    const module3_1 = await Module.create({
      courseId: course3._id,
      title: 'Digital Marketing Overview',
      description: 'Introduction to digital marketing channels',
      order: 1,
    });

    const lesson3_1_1 = await Lesson.create({
      moduleId: module3_1._id,
      title: 'Understanding Digital Marketing',
      content: 'Digital marketing encompasses all marketing efforts that use electronic devices or the internet. It includes SEO, social media, email, content marketing, and more.',
      videoUrl: 'https://example.com/videos/digital-marketing-intro.mp4',
      duration: 18,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson3_1_1._id,
      title: 'Digital Marketing Quiz',
      questions: [
        {
          question: 'Which of these is NOT a digital marketing channel?',
          options: ['SEO', 'Social Media', 'TV Commercials', 'Email Marketing'],
          correctAnswer: 2,
        },
      ],
    });

    const module3_2 = await Module.create({
      courseId: course3._id,
      title: 'Social Media Marketing',
      description: 'Building your brand on social platforms',
      order: 2,
    });

    const lesson3_2_1 = await Lesson.create({
      moduleId: module3_2._id,
      title: 'Social Media Strategy',
      content: 'A successful social media strategy requires understanding your audience, choosing the right platforms, creating engaging content, and measuring results.',
      videoUrl: 'https://example.com/videos/social-media-strategy.mp4',
      duration: 22,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson3_2_1._id,
      title: 'Social Media Quiz',
      questions: [
        {
          question: 'What is the first step in creating a social media strategy?',
          options: ['Posting content', 'Understanding your audience', 'Buying followers', 'Deleting old posts'],
          correctAnswer: 1,
        },
      ],
    });

    // Course 4: Financial Management
    const course4 = await Course.create({
      title: 'Financial Management',
      description: 'Essential financial skills for entrepreneurs including budgeting, cash flow management, and financial analysis.',
      category: 'Financial Management',
      difficultyLevel: 'Intermediate',
      thumbnail: 'https://example.com/thumbnails/financial-management.jpg',
      estimatedDuration: 220,
      isPublished: true,
    });

    const module4_1 = await Module.create({
      courseId: course4._id,
      title: 'Financial Fundamentals',
      description: 'Understanding basic financial concepts',
      order: 1,
    });

    const lesson4_1_1 = await Lesson.create({
      moduleId: module4_1._id,
      title: 'Reading Financial Statements',
      content: 'Financial statements include the balance sheet, income statement, and cash flow statement. Understanding these documents is crucial for business success.',
      videoUrl: 'https://example.com/videos/financial-statements.mp4',
      duration: 28,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson4_1_1._id,
      title: 'Financial Statements Quiz',
      questions: [
        {
          question: 'What does the balance sheet show?',
          options: ['Profit over time', 'Assets, liabilities, and equity', 'Cash flow only', 'Revenue only'],
          correctAnswer: 1,
        },
        {
          question: 'Which statement shows profitability?',
          options: ['Balance Sheet', 'Cash Flow Statement', 'Income Statement', 'Equity Statement'],
          correctAnswer: 2,
        },
      ],
    });

    const module4_2 = await Module.create({
      courseId: course4._id,
      title: 'Cash Flow Management',
      description: 'Managing your business cash flow effectively',
      order: 2,
    });

    const lesson4_2_1 = await Lesson.create({
      moduleId: module4_2._id,
      title: 'Cash Flow Basics',
      content: 'Cash flow is the movement of money in and out of your business. Positive cash flow means more money coming in than going out, which is essential for survival.',
      videoUrl: 'https://example.com/videos/cash-flow.mp4',
      duration: 24,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson4_2_1._id,
      title: 'Cash Flow Quiz',
      questions: [
        {
          question: 'What does positive cash flow indicate?',
          options: ['Business is losing money', 'More money coming in than going out', 'No transactions', 'High debt'],
          correctAnswer: 1,
        },
      ],
    });

    // Course 5: Government Schemes Guide
    const course5 = await Course.create({
      title: 'Government Schemes Guide',
      description: 'Navigate government support programs and funding opportunities available for entrepreneurs and small businesses.',
      category: 'Government Schemes',
      difficultyLevel: 'Beginner',
      thumbnail: 'https://example.com/thumbnails/government-schemes.jpg',
      estimatedDuration: 160,
      isPublished: true,
    });

    const module5_1 = await Module.create({
      courseId: course5._id,
      title: 'Understanding Government Schemes',
      description: 'Overview of available government support',
      order: 1,
    });

    const lesson5_1_1 = await Lesson.create({
      moduleId: module5_1._id,
      title: 'Types of Government Support',
      content: 'Government support for entrepreneurs includes grants, loans, tax incentives, mentoring programs, and incubation facilities. Each type serves different business needs.',
      videoUrl: 'https://example.com/videos/government-support.mp4',
      duration: 20,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson5_1_1._id,
      title: 'Government Support Quiz',
      questions: [
        {
          question: 'Which type of government support does not require repayment?',
          options: ['Loans', 'Grants', 'Tax incentives', 'All require repayment'],
          correctAnswer: 1,
        },
      ],
    });

    const module5_2 = await Module.create({
      courseId: course5._id,
      title: 'Application Process',
      description: 'How to apply for government schemes',
      order: 2,
    });

    const lesson5_2_1 = await Lesson.create({
      moduleId: module5_2._id,
      title: 'Preparing Your Application',
      content: 'Successful applications require thorough preparation, including business plans, financial projections, and meeting all eligibility criteria.',
      videoUrl: 'https://example.com/videos/application-prep.mp4',
      duration: 25,
      order: 1,
    });

    await Quiz.create({
      lessonId: lesson5_2_1._id,
      title: 'Application Quiz',
      questions: [
        {
          question: 'What is a common requirement for government scheme applications?',
          options: ['No documentation', 'Business plan and financial projections', 'Only verbal application', 'No eligibility criteria'],
          correctAnswer: 1,
        },
      ],
    });

    console.log('✅ Seed data created successfully!');
    console.log(`Created 5 courses with modules, lessons, and quizzes`);
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
};

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/entreskill');
    console.log('Connected to MongoDB');
    await seedCoursesInternal();
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

module.exports = { seedCourses, seedCoursesInternal };

if (require.main === module) {
  seedCourses();
}
