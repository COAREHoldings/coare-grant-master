'use client';

import { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface CREDashboardProps {
  title: string;
  specificAims: string;
  researchStrategy: string;
  hypothesis?: string;
  mechanism: string;
}

const DOMAIN_LABELS: Record<string, string> = {
  hypothesisClarity: 'Hypothesis Clarity',
  novelty: 'Novelty',
  mechanisticDepth: 'Mechanistic Depth',
  statisticalRigor: 'Statistical Rigor',
  feasibility: 'Feasibility',
  fundingAlignment: 'Funding Alignment'
};

export default function CREDashboard({ title, specificAims, researchStrategy, hypothesis, mechanism }: CREDashboardProps) {
  const [scores, setScores] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runAnalysis = async () => {
    if (!specificAims && !researchStrategy) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cre-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, specificAims, researchStrategy, hypothesis, mechanism })
      });
      const data = await res.json();
      setScores(data);
    } catch (error) {
      console.error('CRE analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 55) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'competitive':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Competitive</span>;
      case 'needs_revision':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Needs Revision</span>;
      default:
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3" /> High Risk</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="p-3 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-slate-900 text-sm">Competitive Readiness</span>
          </div>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="p-1.5 text-purple-600 hover:bg-purple-100 rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3">
        {!scores ? (
          <button
            onClick={runAnalysis}
            disabled={loading || (!specificAims && !researchStrategy)}
            className="w-full py-2 text-sm bg-purple-600 text-white font-medium rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Run CRE Analysis'}
          </button>
        ) : (
          <div className="space-y-3">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{scores.overallScore}</div>
              <div className="text-xs text-slate-500 mb-2">Overall Score</div>
              {getStatusBadge(scores.readinessStatus)}
            </div>

            {/* Domain Scores */}
            <div className="space-y-2 pt-3 border-t">
              {Object.entries(DOMAIN_LABELS).map(([key, label]) => {
                const score = scores[key]?.score || 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-medium">{score}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreColor(score)} transition-all`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full text-xs text-purple-600 hover:underline"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>

            {showDetails && (
              <div className="space-y-2 text-xs">
                {scores.keyStrengths?.length > 0 && (
                  <div className="bg-green-50 p-2 rounded">
                    <div className="font-medium text-green-700 mb-1">Strengths</div>
                    <ul className="text-green-600 space-y-0.5">
                      {scores.keyStrengths.map((s: string, i: number) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                )}
                {scores.criticalWeaknesses?.length > 0 && (
                  <div className="bg-red-50 p-2 rounded">
                    <div className="font-medium text-red-700 mb-1">Weaknesses</div>
                    <ul className="text-red-600 space-y-0.5">
                      {scores.criticalWeaknesses.map((w: string, i: number) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>
                )}
                {scores.revisionPriorities?.length > 0 && (
                  <div className="bg-amber-50 p-2 rounded">
                    <div className="font-medium text-amber-700 mb-1">Revision Priorities</div>
                    <ol className="text-amber-600 space-y-0.5 list-decimal list-inside">
                      {scores.revisionPriorities.map((p: string, i: number) => <li key={i}>{p}</li>)}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-[10px] text-slate-400 mt-3 text-center">
          Advisory analysis only. Does not block export.
        </p>
      </div>
    </div>
  );
}
