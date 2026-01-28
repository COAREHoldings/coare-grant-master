'use client';

import type { Publication } from '../types';
import { ExternalLink, Trash2, BookOpen } from 'lucide-react';

interface Props {
  publication: Publication;
  onRemove?: (id: string) => void;
  compact?: boolean;
}

export default function PublicationCard({ publication, onRemove, compact }: Props) {
  const authorList = publication.authors?.slice(0, 3).map(a => a.name).join(', ') || 'Unknown';
  const hasMoreAuthors = (publication.authors?.length || 0) > 3;

  if (compact) {
    return (
      <div className="p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
        <p className="text-sm font-medium text-slate-900 line-clamp-1">{publication.title}</p>
        <p className="text-xs text-slate-500 mt-1">
          {publication.journal} ({publication.year})
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 line-clamp-2">{publication.title}</h4>
          <p className="text-sm text-slate-600 mt-1">
            {authorList}{hasMoreAuthors && ' et al.'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            <span className="font-medium">{publication.journal}</span>
            {publication.volume && ` ${publication.volume}`}
            {publication.issue && `(${publication.issue})`}
            {publication.pages && `: ${publication.pages}`}
            {' '}({publication.year})
          </p>
          
          <div className="flex items-center gap-4 mt-2">
            {publication.citationCount !== undefined && (
              <span className="text-xs text-slate-500">
                {publication.citationCount} citations
              </span>
            )}
            {publication.doi && (
              <a
                href={`https://doi.org/${publication.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                DOI
              </a>
            )}
            {publication.pmid && (
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${publication.pmid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <BookOpen className="w-3 h-3" />
                PubMed
              </a>
            )}
          </div>
        </div>
        
        {onRemove && (
          <button
            onClick={() => onRemove(publication.id)}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Remove publication"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {publication.abstract && (
        <p className="text-xs text-slate-500 mt-3 line-clamp-2">{publication.abstract}</p>
      )}
    </div>
  );
}
