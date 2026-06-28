namespace ChefAI.RagApi.Configuration;

public class RagOptions
{
    public const string SectionName = "Rag";

    public int ChunkSize { get; set; } = 800;
    public int ChunkOverlap { get; set; } = 150;
    public int DefaultTopK { get; set; } = 5;
    public double MinSimilarityScore { get; set; } = 0.5;
    public long MaxUploadBytes { get; set; } = 10 * 1024 * 1024;
}
