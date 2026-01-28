'use client';

import { useState } from 'react';
import { Loader2, Search, Lightbulb, BookMarked } from 'lucide-react';
import type { LiteratureGap, CitationSuggestion } from '../types';

interface Props {
  onFindGaps: (abstract: string, researchArea: string) => Promise<{ gaps: LiteratureGap[] }>;
  loading: boolean;
}

export default function LiteratureHelper({ onFindGaps, loading }: Props) {
  const [abstract, setAbstract] = useState('');
  const [researchArea, setResearchArea] = useState('');
  const [gaps, setGaps] = useState<LiteratureGap[]>([]);

  const handleFindGaps = async () => {
    if (!abstract.trim() || !researchArea.trim()) return;
    try {
      const result = await onFindGaps(abstract, researchArea);
      setGaps(result.gaps || []);
    } catch (e) {
      console.error(e);
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Literature Gap Finder</h3>
        <p className="text-sm text-slate-600">
          Analyze your research abstract to identify gaps in the current literature.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Research Area</label>
          <input
            type="text"
            value={researchArea}
            onChange={e => setResearchArea(e.target.value)}
            placeholder="e.g., Cancer immunotherapy, Alzheimer's disease..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your Research Abstract</label>
          <textarea
            value={abstract}
            onChange={e => setAbstract(e.target.value)}
            placeholder="Paste your abstract or research summary here..."
            rows={6}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleFindGaps}
          disabled={loading || !abstract.trim() || !researchArea.trim()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Analyzing...' : 'Find Literature Gaps'}
        </button>
      </div>

      {gaps.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Identified Gaps ({gaps.length})
          </h4>
          
          <div className="space-y-3">
            {gaps.map((gap, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-800 flex-1">{gap.gap}</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRelevanceColor(gap.relevance)}`}>
                    {gap.relevance}
                  </span>
                </div>
                {gap.suggestedApproach && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 font-medium mb-1">Suggested Approach:</p>
                    <p className="text-sm text-slate-600">{gap.suggestedApproach}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
