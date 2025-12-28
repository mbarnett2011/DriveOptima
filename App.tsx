import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FolderIcon,
  DocumentTextIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getMockDriveData } from './services/mockDrive';
import { analyzeDriveStructure } from './services/geminiService';
import { DriveState, OptimizationReport } from './types';

// Declare types for window.google to avoid TS errors
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const STORAGE_KEY = 'driveOptimaUser';

const App: React.FC = () => {
  // BYPASS: Initialize with a hardcoded demo user
  const [user, setUser] = useState<string | null>('demo@driveoptima.ai');
  const [authError, setAuthError] = useState('');

  const [driveData, setDriveData] = useState<DriveState | null>(null);
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [isWeeklyMode, setIsWeeklyMode] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  // Initialize Drive Data
  useEffect(() => {
    setDriveData(getMockDriveData());
  }, []);

  // Removed Google Identity Services initialization for Demo Mode

  // Check for persisted user session (Optional in demo mode, but good for behavior)
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = () => {
    // BYPASS: Direct login for demo
    const demoUser = 'demo@driveoptima.ai';
    setUser(demoUser);
    localStorage.setItem(STORAGE_KEY, demoUser);
    setAuthError('');
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setReport(null);
    setSelectedRecommendations(new Set());
    setCompletedActions(new Set());
  };

  // Calculate File Type Distribution
  const fileTypeData = useMemo(() => {
    if (!driveData) return [];
    const counts: Record<string, number> = {};

    driveData.files.forEach(file => {
      let type = 'Other';
      if (file.mimeType.includes('document') || file.mimeType.includes('word')) type = 'Docs';
      else if (file.mimeType.includes('pdf')) type = 'PDF';
      else if (file.mimeType.includes('image') || file.mimeType.includes('jpeg') || file.mimeType.includes('png')) type = 'Images';
      else if (file.mimeType.includes('sheet') || file.mimeType.includes('excel')) type = 'Sheets';
      else if (file.mimeType.includes('text')) type = 'Text';
      else if (file.mimeType.includes('folder')) type = 'Folders';

      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [driveData]);

  const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#f59e0b', '#ef4444', '#64748b'];

  const runAnalysis = useCallback(async (weekly: boolean = false) => {
    if (!driveData) return;
    setLoading(true);
    setIsWeeklyMode(weekly);
    try {
      const result = await analyzeDriveStructure(driveData, weekly);
      setReport(result);
      setSelectedRecommendations(new Set(result.recommendations.map(r => r.id)));
    } catch (err) {
      console.error(err);
      alert("Failed to analyze drive. Check console for details.");
    } finally {
      setLoading(false);
    }
  }, [driveData]);

  const toggleRecommendation = (id: string) => {
    const next = new Set(selectedRecommendations);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRecommendations(next);
  };

  const applyChanges = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCompletedActions(new Set([...completedActions, ...Array.from(selectedRecommendations)]));
    setLoading(false);
    alert("Changes successfully applied to your Google Drive!");
  };

  const applySingleRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCompletedActions(prev => new Set([...prev, id]));
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'RENAME': return <DocumentTextIcon className="w-5 h-5" />;
      case 'MOVE': return <ArrowRightIcon className="w-5 h-5" />;
      case 'CONSOLIDATE': return <FolderIcon className="w-5 h-5" />;
      default: return <SparklesIcon className="w-5 h-5" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'RENAME': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'MOVE': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'CONSOLIDATE': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  // --- RENDER STATES ---

  // 1. Login Screen (Only shown if user manually signs out)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        {/* Mobile optimized card width max-w-sm (approx 384px) */}
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <div className="flex justify-center mb-6">
              {/* Standard icon size container w-12 h-12 (48px) */}
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md transform -rotate-3">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">DriveOptima AI</h2>
            <p className="text-center text-gray-500 text-sm mb-8 px-2">
              Your intelligent storage architect. Analyze, organize, and optimize your Google Drive effortlessly.
            </p>

            <div className="space-y-4">
              {authError && (
                <div className="flex items-center gap-3 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
                  <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{authError}</span>
                </div>
              )}

              <button
                onClick={handleLogin}
                className="w-full h-12 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm transition-all flex justify-center items-center gap-3 group active:scale-[0.98]"
              >
                {/* Standard size google logo w-5 h-5 (20px) */}
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google Logo" />
                <span>Enter Demo Mode</span>
              </button>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">Secure Access via OAuth 2.0 (Disabled for Demo)</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Main App
  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Modern Sticky Header with Glassmorphism */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">DriveOptima</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 rounded-full border border-gray-200/50">
                <UserCircleIcon className="w-5 h-5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-600 hidden sm:inline">{user}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Empty State / Dashboard Start */}
        {!report && !loading && (
          <div className="max-w-2xl mx-auto mt-12 text-center px-4">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <FolderIcon className="w-10 h-10 text-indigo-600" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Tame your digital chaos.
            </h1>
            <p className="text-base sm:text-lg text-gray-500 mb-10 leading-relaxed max-w-lg mx-auto">
              We analyze your file contents and hierarchy to recommend renaming, moving, and consolidation strategies that make sense.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => runAnalysis(false)}
                className="w-full sm:w-auto h-12 px-8 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Start Deep Analysis
              </button>
              <button
                onClick={() => runAnalysis(true)}
                className="w-full sm:w-auto h-12 px-8 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <ClockIcon className="w-5 h-5 text-gray-400" />
                Quick Weekly Sync
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 inline-flex px-4 py-2 rounded-full border border-amber-100 max-w-full">
              <LockClosedIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Shared files not owned by you are safe.</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-700">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mt-8">Analyzing Architecture</h3>
            <p className="text-gray-400 mt-2">Gemini is reviewing {driveData?.files.length} files...</p>
          </div>
        )}

        {/* Report Dashboard */}
        {report && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">

            {/* Sidebar - Stats & Controls */}
            <div className="lg:col-span-4 space-y-6">

              {/* Impact Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <ChartBarIcon className="w-4 h-4" /> Impact Analysis
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{report.stats.redundantFolders}</div>
                    <div className="text-xs font-medium text-gray-500 mt-1">Redundant Folders</div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="text-2xl font-bold text-indigo-600">{report.stats.potentialSpaceSaved}</div>
                    <div className="text-xs font-medium text-indigo-600/70 mt-1">Space Saved</div>
                  </div>
                </div>

                <div className="h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fileTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {fileTypeData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                        itemStyle={{ color: '#1f2937', fontSize: '12px', fontWeight: 600 }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={24}
                        iconType="circle"
                        iconSize={6}
                        wrapperStyle={{ fontSize: '11px', color: '#6b7280' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Action Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-semibold text-gray-700">Selected Actions</span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{selectedRecommendations.size}</span>
                </div>
                <p className="text-xs text-gray-400 mb-6">
                  Review the recommendations on the right and select the ones you want to apply to your Drive.
                </p>
                <button
                  onClick={applyChanges}
                  disabled={selectedRecommendations.size === 0}
                  className="w-full h-10 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Apply Selected
                </button>
              </div>

            </div>

            {/* Main Feed - Recommendations */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Optimization Plan</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600">
                    {isWeeklyMode ? 'Quick Scan' : 'Deep Scan'}
                  </span>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
                <div className="flex gap-3">
                  <SparklesIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900 mb-1">AI Executive Summary</h4>
                    <p className="text-sm text-indigo-800/80 leading-relaxed">{report.summary}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {report.recommendations.map((rec) => {
                  const isSelected = selectedRecommendations.has(rec.id);
                  const isCompleted = completedActions.has(rec.id);
                  const colorClass = getRecommendationColor(rec.type);

                  return (
                    <div
                      key={rec.id}
                      onClick={() => !isCompleted && toggleRecommendation(rec.id)}
                      className={`
                         group relative p-5 rounded-xl border transition-all cursor-pointer select-none
                         ${isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' :
                          isSelected ? 'bg-white border-indigo-300 shadow-md ring-1 ring-indigo-50' :
                            'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm'}
                       `}
                    >
                      <div className="flex gap-4">

                        {/* Icon Box */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClass} flex-shrink-0`}>
                          {getRecommendationIcon(rec.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{rec.type}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rec.impactScore > 80 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {rec.impactScore}% Impact
                            </span>
                          </div>

                          {/* Dynamic Content based on Type */}
                          <div className="mb-2">
                            {rec.type === 'RENAME' && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                <span className="font-medium text-gray-900 line-through decoration-gray-300 text-opacity-70">{rec.currentPath}</span>
                                <ArrowRightIcon className="w-4 h-4 text-gray-400 hidden sm:block" />
                                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{rec.suggestedName}</span>
                              </div>
                            )}
                            {(rec.type === 'MOVE' || rec.type === 'CONSOLIDATE') && (
                              <div className="text-sm text-gray-800">
                                <span className="font-medium">"{rec.currentPath}"</span>
                                <span className="text-gray-400 mx-2">→</span>
                                <span className="font-semibold text-gray-900">{rec.suggestedFolderId || 'Target Folder'}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-gray-500 leading-normal">
                            {rec.reasoning}
                          </p>

                          {!isCompleted && rec.type === 'RENAME' && (
                            <button
                              onClick={(e) => applySingleRename(e, rec.id)}
                              className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Quick Apply
                            </button>
                          )}
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-center self-center pl-2">
                          <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center
                              ${isCompleted ? 'bg-green-500 border-green-500' :
                              isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 group-hover:border-indigo-300'}
                            `}>
                            {(isSelected || isCompleted) && <CheckCircleIcon className="w-5 h-5 text-white" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default App;