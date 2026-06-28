using ChefAI.RagApi.Configuration;
using ChefAI.RagApi.Data;
using ChefAI.RagApi.DTOs;
using ChefAI.RagApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Pgvector;
using Pgvector.EntityFrameworkCore;

namespace ChefAI.RagApi.Services;

public class VectorSearchService
{
    private readonly RagDbContext _db;
    private readonly OpenRouterEmbeddingService _embedder;
    private readonly RagOptions _options;

    public VectorSearchService(
        RagDbContext db,
        OpenRouterEmbeddingService embedder,
        IOptions<RagOptions> options)
    {
        _db = db;
        _embedder = embedder;
        _options = options.Value;
    }

    public async Task<SearchResponse> SearchAsync(string query, int? topK, CancellationToken cancellationToken = default)
    {
        query = query.Trim();
        if (string.IsNullOrWhiteSpace(query))
            return new SearchResponse([], 0, _options.MinSimilarityScore);

        var k = Math.Clamp(topK ?? _options.DefaultTopK, 1, 20);
        var minScore = Math.Clamp(_options.MinSimilarityScore, 0, 1);
        var queryVector = new Vector(await _embedder.EmbedQueryAsync(query, cancellationToken));

        // Fetch extra candidates so filtering by min similarity still yields up to k results.
        var candidateLimit = Math.Clamp(k * 4, k, 50);

        var rows = await _db.DocumentChunks
            .AsNoTracking()
            .Where(c => c.Document.Status == DocumentStatus.Ready && c.Embedding != null)
            .OrderBy(c => c.Embedding!.CosineDistance(queryVector))
            .Take(candidateLimit)
            .Select(c => new
            {
                c.Content,
                c.ChunkIndex,
                c.Document.FileName,
                Score = 1 - c.Embedding!.CosineDistance(queryVector),
            })
            .ToListAsync(cancellationToken);

        var results = rows
            .Where(r => r.Score >= minScore)
            .Take(k)
            .Select(r => new SearchResultItem(r.Content, r.FileName, r.ChunkIndex, Math.Round(r.Score, 4)))
            .ToList();

        return new SearchResponse(results, results.Count, minScore);
    }
}
