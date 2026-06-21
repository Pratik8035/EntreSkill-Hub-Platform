// src/pages/Assessment.jsx
// Assessment Wizard page – multi‑step flow for skills, interests, experience level and review.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import skillService from '../services/skillService.js';
import interestService from '../services/interestService.js';
import assessmentService from '../services/assessmentService.js';
import { loadDraft, saveDraft, clearDraft } from '../services/draftStorage.js';

import MultiSelectSearch from '../components/MultiSelectSearch.jsx';
import ProficiencySelect from '../components/ProficiencySelect.jsx';
import WeightSlider from '../components/WeightSlider.jsx';
import AssessmentGuard from '../components/AssessmentGuard.jsx';

const STEP_SKILLS = 0;
const STEP_INTERESTS = 1;
const STEP_EXPERIENCE = 2;
const STEP_REVIEW = 3;

const Assessment = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(STEP_SKILLS);
  const [allSkills, setAllSkills] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);
  const [allInterests, setAllInterests] = useState([]);
  const [interestCategories, setInterestCategories] = useState([]);

  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setStep(draft.step ?? STEP_SKILLS);
      setSelectedSkills(draft.selectedSkills ?? []);
      setSelectedSkillIds((draft.selectedSkills ?? []).map((s) => s.skillId));
      setSelectedInterests(draft.selectedInterests ?? []);
      setSelectedInterestIds((draft.selectedInterests ?? []).map((i) => i.interestId));
      setExperienceLevel(draft.experienceLevel ?? '');
    }
  }, []);

  // Fetch data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, skillCatRes, interestsRes, interestCatRes] = await Promise.all([
          skillService.getSkills(),
          skillService.getSkillCategories(),
          interestService.getInterests(),
          interestService.getInterestCategories(),
        ]);
        setAllSkills(skillsRes);
        setSkillCategories(skillCatRes);
        setAllInterests(interestsRes);
        setInterestCategories(interestCatRes);
      } catch (err) {
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, []);

  // Sync selectedSkills when skill IDs change
  useEffect(() => {
    const updated = selectedSkillIds.map((id) => {
      const existing = selectedSkills.find((s) => s.skillId === id);
      return existing ? existing : { skillId: id, proficiencyLevel: 'beginner' };
    });
    setSelectedSkills(updated);
  }, [selectedSkillIds]);

  // Sync selectedInterests when interest IDs change
  useEffect(() => {
    const updated = selectedInterestIds.map((id) => {
      const existing = selectedInterests.find((i) => i.interestId === id);
      return existing ? existing : { interestId: id, preferenceWeight: 1 };
    });
    setSelectedInterests(updated);
  }, [selectedInterestIds]);

  const persistDraft = (nextStep) => {
    const draft = {
      step: nextStep,
      selectedSkills,
      selectedInterests,
      experienceLevel,
    };
    saveDraft(draft);
  };

  const handleNext = () => {
    const next = step + 1;
    setStep(next);
    persistDraft(next);
  };

  const handleBack = () => {
    const prev = step - 1;
    setStep(prev);
    persistDraft(prev);
  };

  const handleSubmit = async () => {
    const payload = {
      experienceLevel,
      skills: selectedSkills,
      interests: selectedInterests,
    };
    try {
      await assessmentService.saveAssessment(payload);
      toast.success('Assessment saved');
      clearDraft();
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to save assessment');
    }
  };

  const renderStep = () => {
    switch (step) {
      case STEP_SKILLS:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Skills</h2>
            <MultiSelectSearch
              items={allSkills}
              selectedIds={selectedSkillIds}
              setSelectedIds={setSelectedSkillIds}
              label="Skills"
              renderItemLabel={(it) => it.name}
              showExtraControl={(skill) => (
                <ProficiencySelect
                  value={selectedSkills.find((s) => s.skillId === skill._id)?.proficiencyLevel}
                  onChange={(val) => {
                    setSelectedSkills((prev) =>
                      prev.map((s) => (s.skillId === skill._id ? { ...s, proficiencyLevel: val } : s))
                    );
                  }}
                />
              )}
            />
          </div>
        );
      case STEP_INTERESTS:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Interests</h2>
            <MultiSelectSearch
              items={allInterests}
              selectedIds={selectedInterestIds}
              setSelectedIds={setSelectedInterestIds}
              label="Interests"
              renderItemLabel={(it) => it.name}
              showExtraControl={(interest) => (
                <WeightSlider
                  value={selectedInterests.find((i) => i.interestId === interest._id)?.preferenceWeight}
                  onChange={(val) => {
                    setSelectedInterests((prev) =>
                      prev.map((i) => (i.interestId === interest._id ? { ...i, preferenceWeight: val } : i))
                    );
                  }}
                />
              )}
            />
          </div>
        );
      case STEP_EXPERIENCE:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Experience Level</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['beginner', 'intermediate', 'experienced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`p-4 rounded border-2 hover:shadow-md transition ${{
                    beginner: 'border-blue-500',
                    intermediate: 'border-green-500',
                    experienced: 'border-purple-500',
                  }[lvl]} ${experienceLevel === lvl ? 'bg-slate-100' : ''}`}
                  onClick={() => setExperienceLevel(lvl)}
                >
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case STEP_REVIEW:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review Your Assessment</h2>
            <section>
              <h3 className="font-medium">Skills</h3>
              <ul className="list-disc list-inside">
                {selectedSkills.map((s) => (
                  <li key={s.skillId}>
                    {allSkills.find((sk) => sk._id === s.skillId)?.name ?? s.skillId}: {s.proficiencyLevel}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="font-medium">Interests</h3>
              <ul className="list-disc list-inside">
                {selectedInterests.map((i) => (
                  <li key={i.interestId}>
                    {allInterests.find((it) => it._id === i.interestId)?.name ?? i.interestId}: {i.preferenceWeight}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="font-medium">Experience Level</h3>
              <p className="ml-2 capitalize">{experienceLevel}</p>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AssessmentGuard>
      <div className="max-w-3xl mx-auto p-4">
        {renderStep()}
        <div className="mt-6 flex justify-between">
          {step > STEP_SKILLS && (
            <button className="px-4 py-2 bg-slate-200 rounded" onClick={handleBack}>
              Back
            </button>
          )}
          {step < STEP_REVIEW && (
            <button className="ml-auto px-4 py-2 bg-primary-600 text-white rounded" onClick={handleNext}>
              Next
            </button>
          )}
          {step === STEP_REVIEW && (
            <button className="ml-auto px-4 py-2 bg-green-600 text-white rounded" onClick={handleSubmit}>
              Submit
            </button>
          )}
        </div>
      </div>
    </AssessmentGuard>
  );
};

export default Assessment;
