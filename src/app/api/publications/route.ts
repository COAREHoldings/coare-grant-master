import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'import-doi':
        return handleImportDOI(data.doi);
      case 'search-pubmed':
        return handleSearchPubMed(data.query, data.maxResults);
      case 'literature-gaps':
        return handleLiteratureGaps(data.abstract, data.researchArea);
      case 'journal-check':
        return handleJournalCheck(data.manuscript, data.targetJournal);
      case 'cover-letter':
        return handleCoverLetter(data.manuscript, data.journal, data.highlights);
      case 'revision-response':
        return handleRevisionResponse(data.comments, data.manuscriptChanges);
      case 'build-profile':
        return handleBuildProfile(data.publications);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Publications API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleImportDOI(doi: string) {
  // Fetch from CrossRef API
  const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    headers: { 'User-Agent': 'GrantMaster/1.0 (mailto:support@grantmaster.com)' },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'DOI not found' }, { status: 404 });
  }

  const data = await response.json();
  const work = data.message;

  const publication = {
    id: crypto.randomUUID(),
    doi: doi,
    title: work.title?.[0] || 'Unknown Title',
    authors: work.author?.map((a: { given?: string; family?: string; affiliation?: { name: string }[] }) => ({
      name: `${a.given || ''} ${a.family || ''}`.trim(),
      affiliation: a.affiliation?.[0]?.name,
    })) || [],
    journal: work['container-title']?.[0] || work.publisher || 'Unknown Journal',
    year: work.published?.['date-parts']?.[0]?.[0] || work.created?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
    volume: work.volume,
    issue: work.issue,
    pages: work.page,
    abstract: work.abstract?.replace(/<[^>]*>/g, ''),
    citationCount: work['is-referenced-by-count'] || 0,
    addedAt: new Date().toISOString(),
  };

  return NextResponse.json(publication);
}

async function handleSearchPubMed(query: string, maxResults = 10) {
  // Search PubMed via NCBI E-utilities
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const ids = searchData.esearchresult?.idlist || [];

  if (ids.length === 0) {
    return NextResponse.json({ results: [] });
  }

  // Fetch details for each ID
  const detailUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
  const detailRes = await fetch(detailUrl);
  const detailData = await detailRes.json();

  const results = ids.map((id: string) => {
    const doc = detailData.result?.[id];
    if (!doc) return null;
    return {
      pmid: id,
      title: doc.title || 'Unknown',
      authors: doc.authors?.map((a: { name: string }) => ({ name: a.name })) || [],
      journal: doc.fulljournalname || doc.source || 'Unknown',
      year: parseInt(doc.pubdate?.split(' ')?.[0]) || new Date().getFullYear(),
      volume: doc.volume,
      issue: doc.issue,
      pages: doc.pages,
    };
  }).filter(Boolean);

  return NextResponse.json({ results });
}

async function handleLiteratureGaps(abstract: string, researchArea: string) {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a scientific literature expert. Analyze the research abstract and identify gaps in the literature that could be addressed. Return JSON array of gaps.`,
      },
      {
        role: 'user',
        content: `Research Area: ${researchArea}\n\nAbstract: ${abstract}\n\nIdentify 3-5 literature gaps with relevance levels (high/medium/low) and suggested approaches.`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return NextResponse.json(result);
}

async function handleJournalCheck(manuscript: { title: string; abstract: string; wordCount?: number }, targetJournal: string) {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a journal submission expert. Check if the manuscript meets typical requirements for the target journal. Return JSON with compliance items, overall score (0-100), and recommendation.`,
      },
      {
        role: 'user',
        content: `Target Journal: ${targetJournal}\n\nManuscript Title: ${manuscript.title}\n\nAbstract: ${manuscript.abstract}\n\nWord Count: ${manuscript.wordCount || 'Unknown'}\n\nCheck compliance with typical journal requirements (scope, format, length, etc.)`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return NextResponse.json({ journal: targetJournal, ...result });
}

async function handleCoverLetter(manuscript: { title: string; abstract: string; highlights?: string[] }, journal: string, highlights?: string[]) {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert at writing journal submission cover letters. Write a professional, concise cover letter that highlights the manuscript's significance and fit for the journal.`,
      },
      {
        role: 'user',
        content: `Journal: ${journal}\n\nManuscript Title: ${manuscript.title}\n\nAbstract: ${manuscript.abstract}\n\nKey Highlights: ${highlights?.join('; ') || manuscript.highlights?.join('; ') || 'See abstract'}\n\nWrite a cover letter for submission.`,
      },
    ],
  });

  return NextResponse.json({
    coverLetter: completion.choices[0].message.content,
    wordCount: completion.choices[0].message.content?.split(/\s+/).length || 0,
  });
}

async function handleRevisionResponse(comments: { reviewer: string; comment: string; category: string }[], manuscriptChanges?: string) {
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert at writing point-by-point responses to peer reviewers. Be professional, thorough, and constructive. Address each comment directly.`,
      },
      {
        role: 'user',
        content: `Reviewer Comments:\n${comments.map((c, i) => `${i + 1}. [${c.reviewer}] (${c.category}): ${c.comment}`).join('\n\n')}\n\n${manuscriptChanges ? `Changes Made:\n${manuscriptChanges}` : ''}\n\nGenerate point-by-point responses to each reviewer comment.`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  return NextResponse.json(result);
}

async function handleBuildProfile(publications: { title: string; authors: { name: string }[]; year: number; citationCount?: number; abstract?: string }[]) {
  // Calculate h-index
  const sortedCitations = publications
    .map(p => p.citationCount || 0)
    .sort((a, b) => b - a);
  let hIndex = 0;
  for (let i = 0; i < sortedCitations.length; i++) {
    if (sortedCitations[i] >= i + 1) hIndex = i + 1;
    else break;
  }

  const totalCitations = sortedCitations.reduce((sum, c) => sum + c, 0);

  // Get top cited works
  const topCited = [...publications]
    .sort((a, b) => (b.citationCount || 0) - (a.citationCount || 0))
    .slice(0, 5);

  // Extract themes and collaborators using AI
  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Analyze the publications and extract research themes. Also generate NIH Biosketch Section C (contribution to science) and Section D (research support) text based on the publications. Return JSON.`,
      },
      {
        role: 'user',
        content: `Publications:\n${publications.map(p => `- ${p.title} (${p.year}): ${p.abstract?.slice(0, 200) || 'No abstract'}`).join('\n')}\n\nExtract research themes and generate biosketch sections.`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const aiResult = JSON.parse(completion.choices[0].message.content || '{}');

  // Count collaborators
  const collaboratorCounts: Record<string, number> = {};
  publications.forEach(p => {
    p.authors?.forEach(a => {
      collaboratorCounts[a.name] = (collaboratorCounts[a.name] || 0) + 1;
    });
  });
  const collaborators = Object.entries(collaboratorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Yearly output
  const yearlyCounts: Record<number, number> = {};
  publications.forEach(p => {
    yearlyCounts[p.year] = (yearlyCounts[p.year] || 0) + 1;
  });
  const yearlyOutput = Object.entries(yearlyCounts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  return NextResponse.json({
    totalPublications: publications.length,
    hIndex,
    totalCitations,
    topCitedWorks: topCited,
    researchThemes: aiResult.themes || [],
    collaborators,
    yearlyOutput,
    biosketchSectionC: aiResult.sectionC || '',
    biosketchSectionD: aiResult.sectionD || '',
  });
}
