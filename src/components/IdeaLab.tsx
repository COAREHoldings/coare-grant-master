'use client';

import { useState } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface IdeaLabProps {
  mechanism: string;
  onComplete: (data: IdeaLabData) => void;
}

interface IdeaLabData {
  unmetNeed: string;
  knowledgeGap: string;
  priorAttempts: string;
  whyNow: string;
  hypothesis: string;
}

export default function IdeaLab({ mechanism, onComplete }: IdeaLabProps) {
  const [expanded, setExpanded] = useState(true);
  const [formData, setFormData] = useState<IdeaLabData>({
    unmetNeed: '',
    knowledgeGap: '',
    priorAttempts: '',
    whyNow: '',
    hypothesis: ''
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/idea-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, mechanism })
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'competitive': return 'text-green-600 bg-green-50';
      case 'needs_revision': return 'text-amber-600 bg-amber-50';
      default: return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200"
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-slate-900">Idea Lab</span>
          <span className="text-xs text-slate-500">Pre-Draft Interrogation</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            Complete this structured interrogation to strengthen your scientific foundation before drafting.
          </div>

          {/* Problem Framing */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700">Problem Framing</h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Unmet Need</label>
              <textarea
                value={formData.unmetNeed}
                onChange={(e) => setFormData({ ...formData, unmetNeed: e.target.value })}
                placeholder="What critical problem remains unsolved?"
                className="w-full p-2 border border-slate-300 rounded text-sm resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Knowledge Gap</label>
              <textarea
                value={formData.knowledgeGap}
                onChange={(e) => setFormData({ ...formData, knowledgeGap: e.target.value })}
                placeholder="What specific knowledge is missing?"
                className="w-full p-2 border border-slate-300 rounded text-sm resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Prior Attempts</label>
              <textarea
                value={formData.priorAttempts}
                onChange={(e) => setFormData({ ...formData, priorAttempts: e.target.value })}
                placeholder="What approaches have been tried and why did they fall short?"
                className="w-full p-2 border border-slate-300 rounded text-sm resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Why Now</label>
              <textarea
                value={formData.whyNow}
                onChange={(e) => setFormData({ ...formData, whyNow: e.target.value })}
                placeholder="Why is this the right time to address this problem?"
                className="w-full p-2 border border-slate-300 rounded text-sm resize-none h-20"
              />
            </div>
          </div>

          {/* Hypothesis Builder */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-medium text-slate-700">Hypothesis Builder</h4>
            <p className="text-xs text-slate-500">Structure: "Our central hypothesis is that ______ drives ______ via ______."</p>
            <textarea
              value={formData.hypothesis}
              onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
              placeholder="Our central hypothesis is that..."
              className="w-full p-2 border border-slate-300 rounded text-sm resize-none h-24"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white font-medium rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Readiness'}
          </button>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-3 pt-4 border-t">
              <div className={`p-3 rounded ${getStatusColor(analysis.overallReadiness)}`}>
                <div className="flex items-center gap-2">
                  {analysis.overallReadiness === 'competitive' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <span className="font-medium capitalize">
                    {analysis.overallReadiness?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {analysis.hypothesisAnalysis && (
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Hypothesis Score</span>
                    <span className="font-medium">{analysis.hypothesisAnalysis.score}/100</span>
                  </div>
                  {analysis.hypothesisAnalysis.issues?.length > 0 && (
                    <ul className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                      {analysis.hypothesisAnalysis.issues.map((issue: string, i: number) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <button
                onClick={() => onComplete(formData)}
                className="w-full py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700"
              >
                Continue to Drafting
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
