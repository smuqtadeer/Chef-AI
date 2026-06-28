using ChefAI.RagApi.Models;

namespace ChefAI.RagApi.DTOs;

public record DocumentResponse(
    Guid Id,
    string FileName,
    string ContentType,
    long FileSize,
    string Status,
    string? ErrorMessage,
    int ChunkCount,
    DateTime UploadedAt);

public record SearchRequest(string Query, int? TopK);

public record SearchResultItem(
    string Content,
    string Source,
    int ChunkIndex,
    double Score);

public record SearchResponse(
    IReadOnlyList<SearchResultItem> Results,
    int ResultCount,
    double MinSimilarityScore);

public static class DocumentMapper
{
    public static DocumentResponse ToResponse(Document doc) => new(
        doc.Id,
        doc.FileName,
        doc.ContentType,
        doc.FileSize,
        doc.Status.ToString().ToLowerInvariant(),
        doc.ErrorMessage,
        doc.ChunkCount,
        doc.UploadedAt);
}
