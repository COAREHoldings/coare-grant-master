'use client';

import { Loader2, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import type { ResearchProfile } from '../types';

interface Props {
  profile: ResearchProfile | null;
  onBuildProfile: () => Promise<ResearchProfile>;
  loading: boolean;
  publicationCount: number;
}

export default function ResearchProfileView({ profile, onBuildProfile, loading, publicationCount }: Props) {
  if (!profile) {
    return (
      <div className="text-center py-12">
        <Award className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Build Your Research Profile</h3>
        <p className="text-sm text-slate-600 mb-6">
          Analyze your publications to generate research themes, calculate h-index, and auto-generate biosketch sections.
        </p>
        <button
          onClick={onBuildProfile}
          disabled={loading || publicationCount === 0}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Build Profile'}
        </button>
        {publicationCount === 0 && (
          <p className="text-xs text-amber-600 mt-3">Import publications first to build your profile.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-indigo-600">{profile.totalPublications}</p>
          <p className="text-sm text-slate-600">Publications</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{profile.hIndex}</p>
          <p className="text-sm text-slate-600">h-Index</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{profile.totalCitations}</p>
          <p className="text-sm text-slate-600">Citations</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{profile.collaborators?.length || 0}</p>
          <p className="text-sm text-slate-600">Collaborators</p>
        </div>
      </div>

      {/* Research Themes */}
      {profile.researchThemes?.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Research Themes
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.researchThemes.map((theme, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
              >
                {typeof theme === 'string' ? theme : theme.theme} 
                {typeof theme !== 'string' && theme.count > 1 && (
                  <span className="text-slate-400 ml-1">({theme.count})</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Collaborators */}
      {profile.collaborators?.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Collaborators
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.collaborators.slice(0, 8).map((collab, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
              >
                {collab.name} <span className="text-blue-400">({collab.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Biosketch Sections */}
      {(profile.biosketchSectionC || profile.biosketchSectionD) && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Auto-Generated Biosketch Content</h4>
          
          {profile.biosketchSectionC && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-slate-700 mb-2">Section C: Contribution to Science</h5>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{profile.biosketchSectionC}</p>
            </div>
          )}
          
          {profile.biosketchSectionD && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-slate-700 mb-2">Section D: Research Support</h5>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{profile.biosketchSectionD}</p>
            </div>
          )}
        </div>
      )}

      {/* Rebuild Button */}
      <button
        onClick={onBuildProfile}
        disabled={loading}
        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
        Rebuild Profile
      </button>
    </div>
  );
}
