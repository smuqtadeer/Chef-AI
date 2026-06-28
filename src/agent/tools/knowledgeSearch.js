import { searchKnowledge } from '../../api/rag.js'

export const definition = {
  name: 'search_knowledge',
  description:
    'Search the uploaded recipe and culinary knowledge base for techniques, ingredients, house recipes, and cooking guidance. Use this FIRST before web_search for recipe and technique questions.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language search query for the knowledge base',
      },
      top_k: {
        type: 'integer',
        description: 'Number of chunks to retrieve (default 5, max 20)',
      },
    },
    required: ['query'],
  },
}

export async function execute({ query, top_k: topK }) {
  try {
    const data = await searchKnowledge(query, topK ?? 5)
    const results = (data.results ?? []).map(r => ({
      content: r.content,
      source: r.source,
      chunkIndex: r.chunkIndex,
      score: r.score,
    }))
    const minScore = data.minSimilarityScore ?? 0.5
    return {
      query,
      resultCount: data.resultCount ?? results.length,
      minSimilarityScore: minScore,
      results,
      note: results.length === 0
        ? `No platform documents met the ${minScore * 100}% similarity threshold — use web_search for this query.`
        : undefined,
    }
  } catch (err) {
    return {
      error: err.message || 'RAG API unavailable. Start the .NET API with dotnet run.',
      resultCount: 0,
      results: [],
    }
  }
}
