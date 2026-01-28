'use client';

import { useState } from 'react';
import { Loader2, MessageSquare, Plus, CheckCircle, XCircle, Upload } from 'lucide-react';
import type { ReviewerComment } from '../types';

interface Props {
  onGenerateResponse: (comments: ReviewerComment[], changes?: string) => Promise<{ responses: { commentId: string; response: string }[] }>;
  loading: boolean;
}

export default function RevisionResponse({ onGenerateResponse, loading }: Props) {
  const [comments, setComments] = useState<ReviewerComment[]>([]);
  const [changes, setChanges] = useState('');
  const [responses, setResponses] = useState<Record<string, string>>({});

  const addComment = () => {
    setComments(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        reviewer: `Reviewer ${prev.length + 1}`,
        comment: '',
        category: 'major',
        addressed: false,
      },
    ]);
  };

  const updateComment = (id: string, updates: Partial<ReviewerComment>) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleGenerate = async () => {
    if (comments.length === 0) return;
    try {
      const result = await onGenerateResponse(comments, changes);
      const newResponses: Record<string, string> = {};
      result.responses?.forEach(r => {
        newResponses[r.commentId] = r.response;
      });
      setResponses(newResponses);
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'major': return 'bg-red-100 text-red-800';
      case 'minor': return 'bg-amber-100 text-amber-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Peer Review Response Generator</h3>
        <p className="text-sm text-slate-600">
          Enter reviewer comments and generate point-by-point responses.
        </p>
      </div>

      {/* Add Comments */}
      <div className="space-y-4">
        {comments.map((comment, idx) => (
          <div key={comment.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <select
                  value={comment.reviewer}
                  onChange={e => updateComment(comment.id, { reviewer: e.target.value })}
                  className="text-sm border border-slate-300 rounded px-2 py-1"
                >
                  <option>Reviewer 1</option>
                  <option>Reviewer 2</option>
                  <option>Reviewer 3</option>
                  <option>Editor</option>
                </select>
                <select
                  value={comment.category}
                  onChange={e => updateComment(comment.id, { category: e.target.value as 'major' | 'minor' | 'editorial' })}
                  className={`text-xs font-medium rounded px-2 py-1 ${getCategoryColor(comment.category)}`}
                >
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                  <option value="editorial">Editorial</option>
                </select>
              </div>
              <button
                onClick={() => removeComment(comment.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={comment.comment}
              onChange={e => updateComment(comment.id, { comment: e.target.value })}
              placeholder="Enter reviewer comment..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />

            {responses[comment.id] && (
              <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                <p className="text-xs font-medium text-green-800 mb-1">Suggested Response:</p>
                <p className="text-sm text-green-700">{responses[comment.id]}</p>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addComment}
          className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Reviewer Comment
        </button>
      </div>

      {/* Manuscript Changes */}
      {comments.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Manuscript Changes (optional)
          </label>
          <textarea
            value={changes}
            onChange={e => setChanges(e.target.value)}
            placeholder="Describe the changes you've made to address the reviews..."
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Generate Button */}
      {comments.length > 0 && (
        <button
          onClick={handleGenerate}
          disabled={loading || comments.every(c => !c.comment.trim())}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          {loading ? 'Generating...' : 'Generate Responses'}
        </button>
      )}
    </div>
  );
}
