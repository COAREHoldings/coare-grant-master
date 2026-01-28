'use client';

import { useState, useCallback } from 'react';
import type {
  Publication,
  Manuscript,
  ResearchProfile,
  PublicationsState,
  LiteratureGap,
  JournalCheckResult,
  ReviewerComment,
} from '../types';

const initialState: PublicationsState = {
  publications: [],
  manuscripts: [],
  currentManuscript: null,
  researchProfile: null,
  loading: false,
  error: null,
};

export function usePublications() {
  const [state, setState] = useState<PublicationsState>(initialState);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const callApi = useCallback(async (action: string, data: Record<string, unknown>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Request failed');
      }
      return await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, error: message, loading: false }));
      throw err;
    }
  }, []);

  const importDOI = useCallback(async (doi: string): Promise<Publication> => {
    const pub = await callApi('import-doi', { doi });
    setState(prev => ({
      ...prev,
      publications: [...prev.publications, pub],
      loading: false,
    }));
    return pub;
  }, [callApi]);

  const searchPubMed = useCallback(async (query: string, maxResults = 10) => {
    const result = await callApi('search-pubmed', { query, maxResults });
    setState(prev => ({ ...prev, loading: false }));
    return result.results as Publication[];
  }, [callApi]);

  const addPublication = useCallback((pub: Publication) => {
    setState(prev => ({
      ...prev,
      publications: [...prev.publications, { ...pub, id: pub.id || crypto.randomUUID(), addedAt: new Date().toISOString() }],
    }));
  }, []);

  const removePublication = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      publications: prev.publications.filter(p => p.id !== id),
    }));
  }, []);

  const findLiteratureGaps = useCallback(async (abstract: string, researchArea: string): Promise<{ gaps: LiteratureGap[] }> => {
    const result = await callApi('literature-gaps', { abstract, researchArea });
    setState(prev => ({ ...prev, loading: false }));
    return result;
  }, [callApi]);

  const checkJournal = useCallback(async (manuscript: { title: string; abstract: string; wordCount?: number }, targetJournal: string): Promise<JournalCheckResult> => {
    const result = await callApi('journal-check', { manuscript, targetJournal });
    setState(prev => ({ ...prev, loading: false }));
    return result;
  }, [callApi]);

  const generateCoverLetter = useCallback(async (manuscript: { title: string; abstract: string; highlights?: string[] }, journal: string): Promise<{ coverLetter: string; wordCount: number }> => {
    const result = await callApi('cover-letter', { manuscript, journal });
    setState(prev => ({ ...prev, loading: false }));
    return result;
  }, [callApi]);

  const generateRevisionResponse = useCallback(async (comments: ReviewerComment[], manuscriptChanges?: string) => {
    const result = await callApi('revision-response', { comments, manuscriptChanges });
    setState(prev => ({ ...prev, loading: false }));
    return result;
  }, [callApi]);

  const buildProfile = useCallback(async (): Promise<ResearchProfile> => {
    const result = await callApi('build-profile', { publications: state.publications });
    setState(prev => ({
      ...prev,
      researchProfile: result,
      loading: false,
    }));
    return result;
  }, [callApi, state.publications]);

  const createManuscript = useCallback((manuscript: Omit<Manuscript, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMs: Manuscript = {
      ...manuscript,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      manuscripts: [...prev.manuscripts, newMs],
      currentManuscript: newMs,
    }));
    return newMs;
  }, []);

  const updateManuscript = useCallback((id: string, updates: Partial<Manuscript>) => {
    setState(prev => ({
      ...prev,
      manuscripts: prev.manuscripts.map(m =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      ),
      currentManuscript: prev.currentManuscript?.id === id
        ? { ...prev.currentManuscript, ...updates, updatedAt: new Date().toISOString() }
        : prev.currentManuscript,
    }));
  }, []);

  const setCurrentManuscript = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      currentManuscript: id ? prev.manuscripts.find(m => m.id === id) || null : null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    setLoading,
    setError,
    importDOI,
    searchPubMed,
    addPublication,
    removePublication,
    findLiteratureGaps,
    checkJournal,
    generateCoverLetter,
    generateRevisionResponse,
    buildProfile,
    createManuscript,
    updateManuscript,
    setCurrentManuscript,
    reset,
  };
}
