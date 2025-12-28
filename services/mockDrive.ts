
import { DriveState } from '../types';

export const getMockDriveData = (): DriveState => {
  const folders = [
    { id: 'root', name: 'My Drive', parentId: null, ownedByMe: true },
    { id: 'f1', name: 'Drafts 2023', parentId: 'root', ownedByMe: true },
    { id: 'f2', name: 'Work Project Final', parentId: 'root', ownedByMe: true },
    { id: 'f3', name: 'Unorganized stuff', parentId: 'root', ownedByMe: true },
    { id: 'f4', name: 'Invoices', parentId: 'root', ownedByMe: true },
    { id: 'f5', name: 'Old Invoices', parentId: 'f4', ownedByMe: true },
    { id: 'f6', name: 'Shared Team Assets', parentId: 'root', ownedByMe: false }, // Shared folder
  ];

  const files = [
    {
      id: 'file1',
      name: 'Untitled-1.docx',
      mimeType: 'application/vnd.google-apps.document',
      parentFolderId: 'f1',
      createdTime: '2023-01-15T10:00:00Z',
      modifiedTime: '2023-01-15T10:00:00Z',
      contentSummary: 'This document contains the marketing strategy for Project Pegasus. It outlines the budget of $50,000 and the launch date in Q4.',
      size: '25KB',
      ownedByMe: true
    },
    {
      id: 'file2',
      name: 'Scan_001.pdf',
      mimeType: 'application/pdf',
      parentFolderId: 'f3',
      createdTime: '2024-05-20T14:30:00Z',
      modifiedTime: '2024-05-20T14:30:00Z',
      contentSummary: 'Invoice #INV-9928 from Acme Corp for Cloud Services. Amount due: $1,200. Date: May 15, 2024.',
      size: '1.2MB',
      ownedByMe: true
    },
    {
      id: 'file3',
      name: 'meeting_notes_v2.txt',
      mimeType: 'text/plain',
      parentFolderId: 'f2',
      createdTime: '2023-11-05T09:00:00Z',
      modifiedTime: '2023-11-05T11:45:00Z',
      contentSummary: 'Notes from the client meeting regarding Project Pegasus. Discussed rebranding and logo design iterations.',
      size: '5KB',
      ownedByMe: true
    },
    {
      id: 'file4',
      name: 'Backup_copy_final_final.docx',
      mimeType: 'application/vnd.google-apps.document',
      parentFolderId: 'f3',
      createdTime: '2023-02-10T16:00:00Z',
      modifiedTime: '2023-02-12T10:00:00Z',
      contentSummary: 'Finalized marketing plan for Pegasus Project. Same as Untitled-1 but with minor edits on the timeline.',
      size: '28KB',
      ownedByMe: true
    },
    {
      id: 'file5',
      name: 'Receipt.jpg',
      mimeType: 'image/jpeg',
      parentFolderId: 'f3',
      createdTime: '2024-06-01T12:00:00Z',
      modifiedTime: '2024-06-01T12:00:00Z',
      contentSummary: 'Receipt for team lunch at Italian Bistro. Amount: $85.50. Project: Team Building.',
      size: '450KB',
      ownedByMe: true
    },
    {
      id: 'file6',
      name: 'Q3_Financials_Shared.xlsx',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parentFolderId: 'f6',
      createdTime: '2024-07-01T09:00:00Z',
      modifiedTime: '2024-07-05T16:00:00Z',
      contentSummary: 'Shared financial report from the Finance Dept. Read-only access.',
      size: '1.5MB',
      ownedByMe: false
    }
  ];

  return { files, folders };
};
