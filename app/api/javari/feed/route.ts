// app/api/admin/javari/feed/route.ts
// API to manually feed knowledge to Javari
// Timestamp: 2025-11-30 05:15 AM EST

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, text, topic, category } = body;

    if (!topic) {
      return NextResponse.json({ success: false, error: 'Topic is required' }, { status: 400 });
    }

    let content = '';
    let source = 'manual_feed';

    // Get content based on type
    if (type === 'url' && url) {
      // Fetch content from URL
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Javari-AI-Knowledge-Bot/1.0'
          }
        });
        
        if (!response.ok) {
          return NextResponse.json({ 
            success: false, 
            error: `Failed to fetch URL: ${response.status}` 
          }, { status: 400 });
        }
        
        const html = await response.text();
        
        // Basic HTML to text conversion
        content = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, '\n')
          .replace(/\s+/g, ' ')
          .trim();
        
        source = url;
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: `Error fetching URL: ${error}` 
        }, { status: 400 });
      }
    } else if (type === 'text' && text) {
      content = text;
      source = 'manual_text_input';
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'No content provided' 
      }, { status: 400 });
    }

    if (content.length < 50) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content too short (minimum 50 characters)' 
      }, { status: 400 });
    }

    // Extract knowledge entries from content
    const entries = extractKnowledgeEntries(content, topic, category, source);
    
    if (entries.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not extract any knowledge from content' 
      }, { status: 400 });
    }

    // Insert into database
    let entriesCreated = 0;
    
    for (const entry of entries) {
      const { error } = await supabase
        .from('javari_knowledge')
        .upsert({
          topic: entry.topic,
          subtopic: entry.subtopic,
          concept: entry.concept,
          explanation: entry.explanation,
          examples: entry.examples,
          tags: entry.tags,
          source: entry.source,
          verified: false,
          keywords: entry.keywords
        }, {
          onConflict: 'topic,subtopic,concept',
          ignoreDuplicates: false
        });

      if (!error) {
        entriesCreated++;
      }
    }

    // Log to learning queue
    await supabase.from('learning_queue').insert({
      topic,
      source_type: type === 'url' ? 'website' : 'manual',
      source_url: source,
      status: 'completed',
      knowledge_entries_created: entriesCreated,
      completed_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      entriesCreated,
      totalExtracted: entries.length,
      message: `Successfully added ${entriesCreated} knowledge entries`
    });

  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}

interface KnowledgeEntry {
  topic: string;
  subtopic: string | null;
  concept: string;
  explanation: string;
  examples: string[] | null;
  tags: string[];
  source: string;
  keywords: string[];
}

function extractKnowledgeEntries(
  content: string, 
  topic: string, 
  category: string,
  source: string
): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [];
  
  // Split content into sections based on headers or paragraphs
  const sections = content.split(/(?:\n\n|\r\n\r\n)/);
  
  let currentSubtopic: string | null = null;
  
  for (const section of sections) {
    const trimmed = section.trim();
    
    if (trimmed.length < 50 || trimmed.length > 2000) continue;
    
    // Check if this looks like a header
    if (trimmed.length < 100 && /^[A-Z#]/.test(trimmed)) {
      currentSubtopic = trimmed.replace(/^#+\s*/, '').substring(0, 100);
      continue;
    }
    
    // Extract a concept (first sentence or line)
    const firstSentence = trimmed.match(/^[^.!?]+[.!?]/);
    const concept = firstSentence 
      ? firstSentence[0].substring(0, 200) 
      : trimmed.substring(0, 100);
    
    // Extract keywords
    const keywords = extractKeywords(trimmed);
    
    // Check for code examples
    const codeMatches = trimmed.match(/```[\s\S]*?```|`[^`]+`/g);
    const examples = codeMatches?.map(c => c.replace(/```\w*\n?/g, '').replace(/`/g, ''));
    
    entries.push({
      topic,
      subtopic: currentSubtopic,
      concept: concept.trim(),
      explanation: trimmed.substring(0, 1500),
      examples: examples || null,
      tags: [category, source.includes('http') ? 'web' : 'manual'],
      source,
      keywords
    });
    
    // Limit entries per document
    if (entries.length >= 20) break;
  }
  
  return entries;
}

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !['this', 'that', 'with', 'from', 'have', 'what', 'when', 'where', 
                   'which', 'would', 'could', 'should', 'there', 'their', 'they', 
                   'them', 'then', 'than', 'these', 'those', 'your', 'here', 'just', 
                   'like', 'some', 'want', 'need', 'help', 'please', 'using', 'used',
                   'will', 'also', 'into', 'more', 'other', 'been', 'being'].includes(w));
  
  // Count frequency
  const freq: Record<string, number> = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  
  // Return top keywords
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// GET - Get knowledge stats
export async function GET() {
  try {
    const { data: stats } = await supabase
      .from('admin_knowledge_overview')
      .select('*')
      .single();

    const { data: recentEntries } = await supabase
      .from('javari_knowledge')
      .select('topic, concept, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      stats,
      recentEntries
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
