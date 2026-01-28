'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, XCircle, AlertTriangle, ClipboardCheck } from 'lucide-react';
import type { JournalCheckResult } from '../types';

interface Props {
  onCheckJournal: (manuscript: { title: string; abstract: string; wordCount?: number }, targetJournal: string) => Promise<JournalCheckResult>;
  loading: boolean;
}

export default function JournalChecker({ onCheckJournal, loading }: Props) {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [journal, setJournal] = useState('');
  const [result, setResult] = useState<JournalCheckResult | null>(null);

  const handleCheck = async () => {
    if (!title.trim() || !abstract.trim() || !journal.trim()) return;
    try {
      const res = await onCheckJournal(
        { title, abstract, wordCount: abstract.split(/\s+/).length },
        journal
      );
      setResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-50 border-green-200';
      case 'fail': return 'bg-red-50 border-red-200';
      default: return 'bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Journal Compliance Checker</h3>
        <p className="text-sm text-slate-600">
          Check if your manuscript meets the requirements for your target journal.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Journal</label>
          <input
            type="text"
            value={journal}
            onChange={e => setJournal(e.target.value)}
            placeholder="e.g., Nature Medicine, JAMA, Cell..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Manuscript Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Your manuscript title"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Abstract</label>
          <textarea
            value={abstract}
            onChange={e => setAbstract(e.target.value)}
            placeholder="Paste your abstract here..."
            rows={5}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleCheck}
          disabled={loading || !title.trim() || !abstract.trim() || !journal.trim()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
          {loading ? 'Checking...' : 'Check Compliance'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">{result.journal}</p>
              <p className="text-sm text-slate-600">{result.recommendation}</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${
                result.overallScore >= 80 ? 'text-green-600' :
                result.overallScore >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {result.overallScore}%
              </p>
              <p className="text-xs text-slate-500">Match Score</p>
            </div>
          </div>

          {/* Compliance Items */}
          {result.compliance?.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">Compliance Check</h4>
              {result.compliance.map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${getStatusColor(item.status)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{item.requirement}</p>
                      <p className="text-xs text-slate-600 mt-1">{item.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
