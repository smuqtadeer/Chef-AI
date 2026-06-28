using ChefAI.RagApi.Configuration;
using ChefAI.RagApi.Data;
using ChefAI.RagApi.DTOs;
using ChefAI.RagApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Pgvector;

namespace ChefAI.RagApi.Services;

public class DocumentIngestionService
{
    private readonly RagDbContext _db;
    private readonly TextExtractionService _extractor;
    private readonly ChunkingService _chunker;
    private readonly OpenRouterEmbeddingService _embedder;
    private readonly RagOptions _options;

    public DocumentIngestionService(
        RagDbContext db,
        TextExtractionService extractor,
        ChunkingService chunker,
        OpenRouterEmbeddingService embedder,
        IOptions<RagOptions> options)
    {
        _db = db;
        _extractor = extractor;
        _chunker = chunker;
        _embedder = embedder;
        _options = options.Value;
    }

    public async Task<DocumentResponse> IngestAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        if (file.Length <= 0)
            throw new InvalidOperationException("File is empty.");

        if (file.Length > _options.MaxUploadBytes)
            throw new InvalidOperationException("File exceeds 10 MB limit.");

        if (!_extractor.IsAllowed(file.FileName))
            throw new InvalidOperationException("Only .txt, .md, and .pdf files are supported.");

        var document = new Document
        {
            Id = Guid.NewGuid(),
            FileName = Path.GetFileName(file.FileName),
            ContentType = file.ContentType ?? "application/octet-stream",
            FileSize = file.Length,
            Status = DocumentStatus.Processing,
            UploadedAt = DateTime.UtcNow,
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync(cancellationToken);

        try
        {
            var text = await _extractor.ExtractAsync(file, cancellationToken);
            if (string.IsNullOrWhiteSpace(text))
                throw new InvalidOperationException("No extractable text found in document.");

            var chunks = _chunker.Chunk(text);
            if (chunks.Count == 0)
                throw new InvalidOperationException("Document produced no chunks after processing.");

            var embeddings = await _embedder.EmbedBatchAsync(chunks, cancellationToken);
            if (embeddings.Count != chunks.Count)
                throw new InvalidOperationException("Embedding service returned unexpected results.");

            var entities = chunks.Select((content, index) => new DocumentChunk
            {
                Id = Guid.NewGuid(),
                DocumentId = document.Id,
                ChunkIndex = index,
                Content = content,
                TokenEstimate = ChunkingService.EstimateTokens(content),
                Embedding = new Vector(embeddings[index]),
            }).ToList();

            _db.DocumentChunks.AddRange(entities);
            document.Status = DocumentStatus.Ready;
            document.ChunkCount = entities.Count;
            document.ErrorMessage = null;
            await _db.SaveChangesAsync(cancellationToken);

            return DocumentMapper.ToResponse(document);
        }
        catch (Exception ex)
        {
            document.Status = DocumentStatus.Failed;
            document.ErrorMessage = ex is InvalidOperationException ? ex.Message : "Document processing failed.";
            document.ChunkCount = 0;
            await _db.SaveChangesAsync(cancellationToken);
            return DocumentMapper.ToResponse(document);
        }
    }

    public async Task<IReadOnlyList<DocumentResponse>> ListAsync(CancellationToken cancellationToken = default)
    {
        var docs = await _db.Documents
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync(cancellationToken);
        return docs.Select(DocumentMapper.ToResponse).ToList();
    }

    public async Task<DocumentResponse?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var doc = await _db.Documents.FindAsync([id], cancellationToken);
        return doc is null ? null : DocumentMapper.ToResponse(doc);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var doc = await _db.Documents.FindAsync([id], cancellationToken);
        if (doc is null) return false;
        _db.Documents.Remove(doc);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
