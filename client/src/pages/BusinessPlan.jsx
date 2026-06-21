import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as businessPlanService from '../services/businessPlanService';
import { FileText, BrainCircuit, Landmark, Calendar, ShieldCheck, DollarSign, Wallet, Percent, ArrowLeft, RefreshCw, BarChart4 } from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessPlan = () => {
  const { businessIdeaId } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await businessPlanService.getBusinessPlan(businessIdeaId);
      setPlan(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setPlan(null); // Plan doesn't exist yet
      } else {
        toast.error('Failed to load business plan');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [businessIdeaId]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await businessPlanService.generateBusinessPlan(businessIdeaId);
      setPlan(res.data);
      toast.success('Business plan generated successfully!');
    } catch (err) {
      toast.error('Failed to generate business plan');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 animate-pulse text-sm font-medium">Fetching details...</div>
      </div>
    );
  }

  // Render generator view if plan doesn't exist yet
  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-outfit text-xl font-bold text-slate-900">Create Business Plan</h3>
            <p className="text-sm text-slate-500">
              Generate a personalized operational layout, startup cost breakdown, and financial forecast based on your profile.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Blueprint...</span>
              </>
            ) : (
              <>
                <span>Generate Plan Blueprint</span>
              </>
            )}
          </button>
          <Link
            to="/recommendations"
            className="block text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
          >
            Back to Recommendations
          </Link>
        </div>
      </div>
    );
  }

  const { costEstimate, revenueProjection, riskScore } = plan;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <Link to="/recommendations" className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Recommendations</span>
          </Link>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-100 rounded-full blur-[80px] opacity-35 -z-10"></div>
            <div>
              <span className="text-[10px] font-bold text-primary-600 uppercase bg-primary-50 px-2 py-0.5 rounded-md">
                Startup Roadmap Blueprint
              </span>
              <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                Business Plan Blueprint
              </h1>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Link
                to={`/ai-mentor?businessIdeaId=${plan.businessIdeaId}`}
                className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-750 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <BrainCircuit className="w-4 h-4" />
                <span>Consult AI Mentor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Financial Summary Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Startup Capital Required</span>
              <Wallet className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">${costEstimate?.totalCost.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Total equipment, marketing & launch expenses.</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Monthly Net Profit</span>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">${revenueProjection?.monthlyProfit.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-600 font-medium">Yearly forecast: ${revenueProjection?.yearlyProfit.toLocaleString()}/yr</p>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Business Risk Profile</span>
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <p className={`text-3xl font-extrabold ${
              riskScore === 'Low' ? 'text-emerald-600' : riskScore === 'Medium' ? 'text-amber-500' : 'text-rose-600'
            }`}>{riskScore}</p>
            <p className="text-[10px] text-slate-400">Risk rating calibrated on skill mapping & costs.</p>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Detailed Financial & Operational Plans (7 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Operational Layout */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="font-outfit text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-500" />
                <span>Executive Summary & Strategy</span>
              </h2>

              <div className="space-y-4 text-sm text-slate-650 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-800">Executive Summary</h4>
                  <p className="mt-1">{plan.executiveSummary}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Target Market</h4>
                  <p className="mt-1">{plan.targetMarket}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Marketing Strategy</h4>
                  <p className="mt-1">{plan.marketingStrategy}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Operations & Milestones</h4>
                  <p className="mt-1">{plan.operationsPlan}</p>
                </div>
              </div>
            </div>

            {/* Financial Ledger Plan */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="font-outfit text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
                <BarChart4 className="w-5 h-5 text-slate-500" />
                <span>Financial Forecast Details</span>
              </h2>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Startup Budget Allocation</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Equipment & Tools</span>
                      <span className="font-semibold text-slate-800">${costEstimate?.equipmentCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Initial Marketing</span>
                      <span className="font-semibold text-slate-800">${costEstimate?.marketingCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Operations Reserve</span>
                      <span className="font-semibold text-slate-800">${costEstimate?.operationalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Miscellaneous Buffer</span>
                      <span className="font-semibold text-slate-800">${costEstimate?.miscCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Income & Overhead Estimate (Monthly)</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Projected Revenue</span>
                      <span className="font-semibold text-emerald-600">${revenueProjection?.monthlyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Projected Operational Expense</span>
                      <span className="font-semibold text-rose-650">${revenueProjection?.monthlyExpense.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Action Widgets (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-outfit text-base font-bold text-slate-900">Mentor Audit</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Consult with our AI Mentor on how to optimize this budget for local conditions, seek microloans, or lower operational risks.
              </p>
              <Link
                to={`/ai-mentor?businessIdeaId=${plan.businessIdeaId}`}
                className="w-full py-2.5 bg-slate-50 hover:bg-primary-50 hover:text-primary-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <BrainCircuit className="w-4 h-4 text-primary-500" />
                <span>Discuss with Mentor</span>
              </Link>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-outfit text-base font-bold text-slate-900">Re-estimate</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                If you have acquired new skills or adjusted your assessment settings, recalculate the business plan details.
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                <span>Recalculate Plan</span>
              </button>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default BusinessPlan;
