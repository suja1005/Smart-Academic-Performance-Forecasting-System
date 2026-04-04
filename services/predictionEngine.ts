
import { AcademicDetails, PerformanceLevel, PredictionResult } from "../types";
import { getImprovementSuggestions } from "./geminiService";

/**
 * Random Forest Ensemble Simulation
 * Simulates 5 decision trees with slightly different randomized weights 
 * to mimic an ensemble voting system.
 */
export async function predictPerformance(details: AcademicDetails, _ignoredModelId: string): Promise<PredictionResult> {
  // Define 5 "Trees" with different randomized feature importances
  const trees = [
    { att: 0.35, marks: 0.20, assign: 0.15, project: 0.20, gpa: 0.10 },
    { att: 0.25, marks: 0.30, assign: 0.10, project: 0.25, gpa: 0.10 },
    { att: 0.30, marks: 0.25, assign: 0.20, project: 0.15, gpa: 0.10 },
    { att: 0.40, marks: 0.15, assign: 0.15, project: 0.20, gpa: 0.10 },
    { att: 0.20, marks: 0.35, assign: 0.15, project: 0.15, gpa: 0.15 },
  ];

  // Map input values to 0-100 scale for calculation
  const inputs = {
    att: details.attendance,
    marks: details.internalMarks,
    assign: details.assignmentScores,
    project: details.projectMarks, // Project marks out of 100
    gpa: (details.previousGPA / 10) * 100,  // Normalized GPA
  };

  // Calculate scores from each tree
  const treeResults = trees.map(tree => (
    (inputs.att * tree.att) +
    (inputs.marks * tree.marks) +
    (inputs.assign * tree.assign) +
    (inputs.project * tree.project) +
    (inputs.gpa * tree.gpa)
  ));

  // Average the results (The Ensemble Vote)
  const finalWeightedScore = treeResults.reduce((a, b) => a + b, 0) / trees.length;

  let level: PerformanceLevel;
  if (finalWeightedScore >= 75) {
    level = PerformanceLevel.LOW_RISK;
  } else if (finalWeightedScore >= 50) {
    level = PerformanceLevel.MEDIUM_RISK;
  } else {
    level = PerformanceLevel.HIGH_RISK;
  }

  // Get AI suggestions based on the ensemble result
  const suggestions = await getImprovementSuggestions(details, level);

  return {
    level,
    score: Math.round(finalWeightedScore),
    suggestions,
    modelUsed: 'Random Forest Ensemble'
  };
}
