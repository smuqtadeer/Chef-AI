namespace ChefAI.RagApi.Configuration;

public class OpenRouterOptions
{
    public const string SectionName = "OpenRouter";

    public string ApiKey { get; set; } = string.Empty;
    public string EmbeddingModel { get; set; } = "openai/text-embedding-3-large";
    public int Dimensions { get; set; } = 1536;
}
