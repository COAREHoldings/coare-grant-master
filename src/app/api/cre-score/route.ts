import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const WEIGHTS = {
  hypothesisClarity: 0.20,
  novelty: 0.20,
  mechanisticDepth: 0.15,
  statisticalRigor: 0.15,
  feasibility: 0.15,
  fundingAlignment: 0.15
};

export async function POST(request: NextRequest) {
  try {
    const { title, specificAims, researchStrategy, hypothesis, mechanism } = await request.json();

    const prompt = `You are an expert NIH grant reviewer. Score this ${mechanism} application on each domain (0-100):

TITLE: ${title}
HYPOTHESIS: ${hypothesis || 'Not explicitly stated'}
SPECIFIC AIMS: ${specificAims}
RESEARCH STRATEGY: ${researchStrategy}

Score each domain and explain:
{
  "hypothesisClarity": { "score": 0-100, "reasoning": "explanation" },
  "novelty": { "score": 0-100, "reasoning": "explanation" },
  "mechanisticDepth": { "score": 0-100, "reasoning": "explanation", "classification": "descriptive|associative|mechanistic|causal_intervention" },
  "statisticalRigor": { "score": 0-100, "reasoning": "explanation" },
  "feasibility": { "score": 0-100, "reasoning": "explanation" },
  "fundingAlignment": { "score": 0-100, "reasoning": "explanation" },
  "keyStrengths": ["list"],
  "criticalWeaknesses": ["list"],
  "revisionPriorities": ["ordered list of what to fix first"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const scores = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Calculate weighted overall score
    const overallScore = Math.round(
      (scores.hypothesisClarity?.score || 0) * WEIGHTS.hypothesisClarity +
      (scores.novelty?.score || 0) * WEIGHTS.novelty +
      (scores.mechanisticDepth?.score || 0) * WEIGHTS.mechanisticDepth +
      (scores.statisticalRigor?.score || 0) * WEIGHTS.statisticalRigor +
      (scores.feasibility?.score || 0) * WEIGHTS.feasibility +
      (scores.fundingAlignment?.score || 0) * WEIGHTS.fundingAlignment
    );

    let readinessStatus = 'high_risk';
    if (overallScore >= 75) readinessStatus = 'competitive';
    else if (overallScore >= 55) readinessStatus = 'needs_revision';

    return NextResponse.json({
      ...scores,
      overallScore,
      readinessStatus,
      weights: WEIGHTS
    });
  } catch (error) {
    console.error('CRE score error:', error);
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
