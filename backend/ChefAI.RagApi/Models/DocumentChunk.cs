using Pgvector;

namespace ChefAI.RagApi.Models;

public class DocumentChunk
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public Document Document { get; set; } = null!;
    public int ChunkIndex { get; set; }
    public string Content { get; set; } = string.Empty;
    public int TokenEstimate { get; set; }
    public Vector? Embedding { get; set; }
}
