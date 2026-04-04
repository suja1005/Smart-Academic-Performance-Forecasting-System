
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
      
      Format the output as a JSON array of objects. Each object must have a "title" (short 2-5 word label), a "category" (e.g., "Time Management", "Study Habits"), a "description" (detailed actionable advice), a "priority" (exactly one of: "High", "Medium", "Low"), and "actionItems" (an array of 2 short, specific tactical steps).
    `;

    // Always use ai.models.generateContent with the model and prompt.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "category", "description", "priority", "actionItems"]
          }
        }
      }
    });

    // Access the text property directly without calling it as a method.
    const result = JSON.parse(response.text || "[]");
    return result.length > 0 ? result : [
      { title: "Attendance Focus", category: "Class Engagement", description: "Improve your attendance to stay engaged with the core curriculum.", priority: "High", actionItems: ["Set daily alarms 30 mins earlier", "Review lecture slides before class"] },
      { title: "Targeted Self-Study", category: "Time Management", description: "Dedicate at least 2 more hours to self-study focused on weak subjects.", priority: "Medium", actionItems: ["Block out 7 PM - 9 PM for focused reading", "Use Pomodoro technique for retention"] },
      { title: "Peer Tutoring", category: "Collaboration", description: "Seek peer tutoring for assignments where scores are below average.", priority: "High", actionItems: ["Identify 2 classmates excelling in the subject", "Schedule a weekend study session"] },
      { title: "Continuous Review", category: "Consistency", description: "Maintain a consistent schedule for previous GPA recovery.", priority: "Low", actionItems: ["Review notes for 15 mins daily", "Create flashcards for core concepts"] }
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
      { title: "Regular Attendance", category: "Class Engagement", description: "Maintain regular attendance and focus on internal assessments.", priority: "High", actionItems: ["Track attendance in a planner", "Participate in 1 discussion per class"] },
      { title: "Exam Preparation", category: "Study Techniques", description: "Review past exam papers to understand question patterns.", priority: "Medium", actionItems: ["Download last 3 years of exams", "Simulate a mock test environment"] },
      { title: "Study Groups", category: "Collaboration", description: "Form study groups with classmates to discuss complex topics.", priority: "Low", actionItems: ["Create a group chat for the hardest class", "Meet weekly at the library"] },
      { title: "Mental Health", category: "Wellbeing", description: "Schedule regular breaks to avoid burnout while studying.", priority: "Medium", actionItems: ["Take a 10 min walk every 2 hours", "Ensure 7 hours of sleep minimum"] }
    ];
  }
}