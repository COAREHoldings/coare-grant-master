export interface Publication {
  id: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title: string;
  authors: Author[];
  journal: string;
  year: number;
  volume?: string;
  issue?: string;
  pages?: string;
  citationCount?: number;
  abstract?: string;
  keywords?: string[];
  grantAcknowledgments?: string[];
  researchThemes?: string[];
  addedAt: string;
}

export interface Author {
  name: string;
  affiliation?: string;
  isCorresponding?: boolean;
}

export interface Manuscript {
  id: string;
  grantId?: string;
  title: string;
  status: 'draft' | 'in-progress' | 'submitted' | 'revision' | 'accepted' | 'published';
  targetJournal?: string;
  coAuthors: Author[];
  content: ManuscriptContent;
  submissionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManuscriptContent {
  abstract?: string;
  introduction?: string;
  methods?: string;
  results?: string;
  discussion?: string;
  references?: string[];
  highlights?: string[];
}

export interface ManuscriptRevision {
  id: string;
  manuscriptId: string;
  revisionNumber: number;
  reviewerComments: ReviewerComment[];
  responseLetter?: string;
  changesMade?: string[];
  createdAt: string;
}

export interface ReviewerComment {
  id: string;
  reviewer: string;
  comment: string;
  category: 'major' | 'minor' | 'editorial';
  response?: string;
  addressed: boolean;
}

export interface ResearchProfile {
  totalPublications: number;
  hIndex: number;
  totalCitations: number;
  topCitedWorks: Publication[];
  researchThemes: { theme: string; count: number }[];
  collaborators: { name: string; count: number }[];
  yearlyOutput: { year: number; count: number }[];
  biosketchSectionC?: string;
  biosketchSectionD?: string;
}

export interface LiteratureGap {
  gap: string;
  relevance: 'high' | 'medium' | 'low';
  suggestedApproach?: string;
}

export interface CitationSuggestion {
  doi?: string;
  pmid?: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  relevanceScore: number;
  reason: string;
}

export interface JournalCheckResult {
  journal: string;
  impactFactor?: number;
  acceptanceRate?: string;
  averageReviewTime?: string;
  compliance: ComplianceItem[];
  overallScore: number;
  recommendation: string;
}

export interface ComplianceItem {
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

export interface PublicationsState {
  publications: Publication[];
  manuscripts: Manuscript[];
  currentManuscript: Manuscript | null;
  researchProfile: ResearchProfile | null;
  loading: boolean;
  error: string | null;
}

export type PublicationAction =
  | 'import-doi'
  | 'search-pubmed'
  | 'literature-gaps'
  | 'journal-check'
  | 'cover-letter'
  | 'revision-response'
  | 'build-profile';
