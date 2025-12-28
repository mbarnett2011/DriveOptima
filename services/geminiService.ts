import { GoogleGenAI, Type } from "@google/genai";
import { DriveState, OptimizationReport } from '../types';

export const analyzeDriveStructure = async (
  driveState: DriveState,
  isWeekly: boolean = false
): Promise<OptimizationReport> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is required for analysis.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-pro-preview';

  const systemPrompt = `
    You are an expert Digital Librarian and File System Architect.
    Your task is to analyze a Google Drive structure and provide optimization recommendations.
    
    CRITICAL CRITERIA:
    1. CONSOLIDATION: Identify folders that should be merged based on content similarity.
    2. RENAMING: Suggest clear, standard names for files (e.g., "Untitled-1" becomes "Project Pegasus - Marketing Strategy").
    3. REMAPPING: Suggest moving files to more logical locations (e.g., invoices to an 'Invoices' folder).
    4. REDUNDANCY: Detect duplicate content even if names differ.
    
    IMPORTANT PERMISSION RULES:
    - You will receive a list of files and folders with an "ownedByMe" property.
    - You MUST NOT generate any recommendations (RENAME, MOVE, CONSOLIDATE, ARCHIVE) for any file or folder where "ownedByMe" is false.
    - These shared items are for context only. For example, you can recommend moving an owned file INTO a shared folder, but you cannot rename the shared folder or move files out of it if you don't own them.
    
    Mode: ${isWeekly ? 'Weekly Checkup (focus on recent items)' : 'Full Initial Deep Dive'}
  `;

  const userPrompt = `
    Current File/Folder Hierarchy:
    Folders: ${JSON.stringify(driveState.folders)}
    Files: ${JSON.stringify(driveState.files)}
    
    Analyze the contents and provide an OptimizationReport in JSON format.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      stats: {
        type: Type.OBJECT,
        properties: {
          redundantFolders: { type: Type.INTEGER },
          misnamedFiles: { type: Type.INTEGER },
          potentialSpaceSaved: { type: Type.STRING }
        },
        required: ['redundantFolders', 'misnamedFiles', 'potentialSpaceSaved']
      },
      recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, description: 'RENAME, MOVE, CONSOLIDATE, ARCHIVE' },
            fileId: { type: Type.STRING },
            folderId: { type: Type.STRING },
            currentPath: { type: Type.STRING },
            suggestedName: { type: Type.STRING },
            suggestedFolderId: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            impactScore: { type: Type.NUMBER }
          },
          required: ['id', 'type', 'reasoning', 'impactScore']
        }
      }
    },
    required: ['summary', 'recommendations', 'stats']
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (!response.text) {
      throw new Error("No text content generated from Gemini.");
    }
    const data = JSON.parse(response.text);
    return data as OptimizationReport;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};