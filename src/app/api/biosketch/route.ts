import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAI() { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' }); }

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      position, 
      institution,
      eraCommons,
      education,
      personalStatement,
      projectRole,
      researchFocus,
      publications
    } = await request.json();

    if (!name || !position) {
      return NextResponse.json({ error: 'Name and position required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert at writing NIH Biographical Sketches following the 2025 Common Forms format.

As of May 25, 2025, NIH requires TWO documents:
1. **Biographical Sketch Common Form** (shared across federal agencies)
2. **NIH Biographical Sketch Supplement** (NIH-specific)

=== BIOGRAPHICAL SKETCH COMMON FORM (3 pages max) ===
Section A: Personal Information
- Name, eRA Commons ID, Position Title, Organization

Section B: Education and Training
- Institution, Location, Degree, Completion Date, Field of Study

Section C: Positions, Scientific Appointments, and Honors
- In reverse chronological order
- Include academic/professional appointments, honors, memberships

Section D: Scholastic Performance (fellowships only - skip for regular applications)

=== NIH BIOGRAPHICAL SKETCH SUPPLEMENT (2 pages max) ===
Section A: Personal Statement
- Up to 4 paragraphs explaining qualifications for this specific project
- First person allowed
- Include up to 4 relevant publications/products

Section B: Contributions to Science
- Up to 5 contributions with narrative description
- Up to 4 citations per contribution
- Describe your specific role and the contribution's impact

Section C: Additional Information (optional)
- Research support, synergistic activities, URLs to full publication lists

FORMATTING REQUIREMENTS:
- Arial 11pt font, 0.5" margins minimum
- No URLs except in specific allowed fields
- Use PMCID for NIH-funded publications
- Personal Statement must connect YOUR expertise to THIS project`;
    

    const userPrompt = `Generate a complete NIH Biosketch using the 2025 Common Forms format for:

Name: ${name}
eRA Commons ID: ${eraCommons || '[TO BE ADDED]'}
Current Position: ${position}
Organization: ${institution || '[TO BE ADDED]'}

Education/Training:
${education || 'Please provide education history'}

Role on Project: ${projectRole || 'Principal Investigator'}

Research Focus Areas: ${researchFocus || 'Not specified'}

Personal Statement Notes (key points to emphasize):
${personalStatement || 'General qualifications for the project'}

Key Publications (for citations):
${publications || 'Will generate placeholder examples'}

Generate BOTH documents:
1. The Biographical Sketch Common Form (Sections A-C)
2. The NIH Biographical Sketch Supplement (Sections A-C)

Format each section with clear headers. Use proper citation format with PMCIDs where applicable.`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
    });

    const biosketch = response.choices[0]?.message?.content || '';

    return NextResponse.json({ biosketch });
  } catch (error) {
    console.error('Biosketch generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate biosketch' },
      { status: 500 }
    );
  }
}
