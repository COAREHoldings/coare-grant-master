'use client';

import { useState } from 'react';
import { Search, Plus, Loader2, FileText } from 'lucide-react';
import type { Publication } from '../types';

interface Props {
  onImportDOI: (doi: string) => Promise<Publication>;
  onSearchPubMed: (query: string) => Promise<Publication[]>;
  onAddPublication: (pub: Publication) => void;
  loading: boolean;
}

export default function ImportPublications({ onImportDOI, onSearchPubMed, onAddPublication, loading }: Props) {
  const [mode, setMode] = useState<'doi' | 'pubmed' | 'manual'>('doi');
  const [doi, setDoi] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Publication[]>([]);
  const [manualPub, setManualPub] = useState({ title: '', authors: '', journal: '', year: new Date().getFullYear() });

  const handleDOIImport = async () => {
    if (!doi.trim()) return;
    try {
      await onImportDOI(doi.trim());
      setDoi('');
    } catch (e) {
      console.error(e);
    }
  };

  const handlePubMedSearch = async () => {
    if (!query.trim()) return;
    try {
      const results = await onSearchPubMed(query.trim());
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualAdd = () => {
    if (!manualPub.title.trim()) return;
    const pub: Publication = {
      id: crypto.randomUUID(),
      title: manualPub.title,
      authors: manualPub.authors.split(',').map(name => ({ name: name.trim() })),
      journal: manualPub.journal,
      year: manualPub.year,
      addedAt: new Date().toISOString(),
    };
    onAddPublication(pub);
    setManualPub({ title: '', authors: '', journal: '', year: new Date().getFullYear() });
  };

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['doi', 'pubmed', 'manual'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              mode === m
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {m === 'doi' ? 'Import by DOI' : m === 'pubmed' ? 'Search PubMed' : 'Manual Entry'}
          </button>
        ))}
      </div>

      {/* DOI Import */}
      {mode === 'doi' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Enter a DOI to automatically import publication metadata.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={doi}
              onChange={e => setDoi(e.target.value)}
              placeholder="10.1000/xyz123"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleDOIImport}
              disabled={loading || !doi.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Import
            </button>
          </div>
        </div>
      )}

      {/* PubMed Search */}
      {mode === 'pubmed' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Search PubMed by author name, title, or keywords.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Author name or keywords..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onKeyDown={e => e.key === 'Enter' && handlePubMedSearch()}
            />
            <button
              onClick={handlePubMedSearch}
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {searchResults.map((pub, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">{pub.title}</p>
                    <p className="text-xs text-slate-500">
                      {pub.journal} ({pub.year})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onAddPublication({ ...pub, id: crypto.randomUUID(), addedAt: new Date().toISOString() });
                      setSearchResults(prev => prev.filter((_, i) => i !== idx));
                    }}
                    className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual Entry */}
      {mode === 'manual' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Manually enter publication details for preprints or unpublished work.</p>
          <div className="space-y-3">
            <input
              type="text"
              value={manualPub.title}
              onChange={e => setManualPub(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Publication title"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={manualPub.authors}
              onChange={e => setManualPub(prev => ({ ...prev, authors: e.target.value }))}
              placeholder="Authors (comma-separated)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <input
                type="text"
                value={manualPub.journal}
                onChange={e => setManualPub(prev => ({ ...prev, journal: e.target.value }))}
                placeholder="Journal / Preprint server"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="number"
                value={manualPub.year}
                onChange={e => setManualPub(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                placeholder="Year"
                className="w-24 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleManualAdd}
              disabled={!manualPub.title.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Add Publication
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
