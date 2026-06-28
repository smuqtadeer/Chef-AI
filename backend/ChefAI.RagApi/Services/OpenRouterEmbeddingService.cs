using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ChefAI.RagApi.Configuration;
using Microsoft.Extensions.Options;

namespace ChefAI.RagApi.Services;

public class OpenRouterEmbeddingService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
    };

    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly OpenRouterOptions _options;
    private readonly ILogger<OpenRouterEmbeddingService> _logger;

    public OpenRouterEmbeddingService(
        HttpClient httpClient,
        IConfiguration configuration,
        IOptions<OpenRouterOptions> options,
        ILogger<OpenRouterEmbeddingService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<IReadOnlyList<float[]>> EmbedBatchAsync(
        IReadOnlyList<string> inputs,
        CancellationToken cancellationToken = default)
    {
        if (inputs.Count == 0) return [];

        var results = new List<float[]>(inputs.Count);
        const int batchSize = 64;

        for (var i = 0; i < inputs.Count; i += batchSize)
        {
            var batch = inputs.Skip(i).Take(batchSize).ToArray();
            var batchResults = await SendEmbeddingRequestAsync(batch, cancellationToken);
            results.AddRange(batchResults);
        }

        return results;
    }

    public async Task<float[]> EmbedQueryAsync(string query, CancellationToken cancellationToken = default)
        => (await EmbedBatchAsync([query], cancellationToken))[0];

    private async Task<IReadOnlyList<float[]>> SendEmbeddingRequestAsync(
        IReadOnlyList<string> inputs,
        CancellationToken cancellationToken)
    {
        var apiKey = SecretConfiguration.GetOpenRouterApiKey(_configuration);
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Embedding service unavailable.");

        var payload = new
        {
            model = _options.EmbeddingModel,
            input = inputs,
            dimensions = _options.Dimensions,
            encoding_format = "float",
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/embeddings");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Headers.TryAddWithoutValidation("HTTP-Referer", "http://localhost:5173");
        request.Headers.TryAddWithoutValidation("X-Title", "ChefAI RAG");
        request.Content = new StringContent(JsonSerializer.Serialize(payload, JsonOptions), Encoding.UTF8, "application/json");

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.SendAsync(request, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenRouter embedding request failed");
            throw new InvalidOperationException("Embedding service unavailable.");
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("OpenRouter returned {StatusCode}: {Body}", (int)response.StatusCode,
                body.Length > 200 ? body[..200] : body);
            var message = (int)response.StatusCode switch
            {
                401 => "Invalid OpenRouter API key. Update OPENROUTER_API_KEY in .env and restart the API.",
                402 => "OpenRouter account has insufficient credits.",
                429 => "OpenRouter rate limit exceeded. Try again shortly.",
                _ => "Embedding service unavailable.",
            };
            throw new InvalidOperationException(message);
        }

        using var doc = JsonDocument.Parse(body);
        var data = doc.RootElement.GetProperty("data");
        var vectors = new List<float[]>();

        foreach (var item in data.EnumerateArray())
        {
            var embedding = item.GetProperty("embedding");
            vectors.Add(embedding.EnumerateArray().Select(v => v.GetSingle()).ToArray());
        }

        return vectors;
    }
}
