
import { GoogleGenAI, Type } from "@google/genai";
import { AcademicDetails, PerformanceLevel } from "../types";

export async function getImprovementSuggestions(details: AcademicDetails, risk: PerformanceLevel) {
  try {
    // Guidelines: Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key.
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Act as an expert academic advisor. Based on the following student performance metrics, provide 4 actionable, encouraging, and specific improvement suggestions.
      
      Metrics:
      - Attendance: ${details.attendance}%
      - Internal Marks: ${details.internalMarks}/100
      - Assignment Scores: ${details.assignmentScores}/100
      - Project Marks: ${details.projectMarks}/100
      - Previous GPA: ${details.previousGPA}/10
      - Current Risk Level: ${risk}
      
      Format the output as a JSON array of strings.
    `;

    // Always use ai.models.generateContent with the model and prompt.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    // Access the text property directly without calling it as a method.
    const result = JSON.parse(response.text || "[]");
    return result.length > 0 ? result : [
      "Improve your attendance to stay engaged with the core curriculum.",
      "Dedicate at least 2 more hours to self-study focused on weak subjects.",
      "Seek peer tutoring for assignments where scores are below average.",
      "Maintain a consistent schedule for previous GPA recovery."
    ];
  } catch (error: any) {
    console.error("Gemini Error:", error);

    // Guidelines: If the request fails with an error message containing "Requested entity was not found.", 
    // it implies an invalid project/API key. The app must prompt the user to select a key again via window.aistudio.openSelectKey().
    if (error?.message?.includes("Requested entity was not found.")) {
      console.warn("API Key error: Requested entity was not found. Resetting and prompting for re-selection.");
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        (window as any).aistudio.openSelectKey();
      }
    }

    return [
      "Maintain regular attendance and focus on internal assessments.",
      "Review past exam papers to understand question patterns.",
      "Form study groups with classmates to discuss complex topics.",
      "Schedule regular breaks to avoid burnout while studying."
    ];
  }
}