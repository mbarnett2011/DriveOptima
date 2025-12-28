
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parentFolderId: string;
  createdTime: string;
  modifiedTime: string;
  contentSummary: string;
  size: string;
  ownedByMe: boolean;
}

export interface DriveFolder {
  id: string;
  name: string;
  parentId: string | null;
  ownedByMe: boolean;
}

export interface DriveState {
  files: DriveFile[];
  folders: DriveFolder[];
}

export enum RecommendationType {
  RENAME = 'RENAME',
  MOVE = 'MOVE',
  CONSOLIDATE = 'CONSOLIDATE',
  ARCHIVE = 'ARCHIVE'
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  fileId?: string;
  folderId?: string;
  currentPath: string;
  suggestedName?: string;
  suggestedFolderId?: string;
  reasoning: string;
  impactScore: number; // 1-100
}

export interface OptimizationReport {
  summary: string;
  recommendations: Recommendation[];
  stats: {
    redundantFolders: number;
    misnamedFiles: number;
    potentialSpaceSaved: string;
  };
}
