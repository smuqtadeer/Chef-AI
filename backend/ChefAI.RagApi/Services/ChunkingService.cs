using ChefAI.RagApi.Configuration;
using Microsoft.Extensions.Options;

namespace ChefAI.RagApi.Services;

public class ChunkingService(IOptions<RagOptions> options)
{
    private readonly RagOptions _options = options.Value;

    public IReadOnlyList<string> Chunk(string text)
    {
        text = text.Replace("\r\n", "\n").Trim();
        if (string.IsNullOrWhiteSpace(text)) return [];

        var chunks = new List<string>();
        var size = Math.Max(200, _options.ChunkSize);
        var overlap = Math.Clamp(_options.ChunkOverlap, 0, size / 2);
        var start = 0;

        while (start < text.Length)
        {
            var end = Math.Min(start + size, text.Length);
            if (end < text.Length)
            {
                var splitAt = FindSplitPoint(text, start, end);
                if (splitAt > start) end = splitAt;
            }

            var chunk = text[start..end].Trim();
            if (chunk.Length > 0) chunks.Add(chunk);

            if (end >= text.Length) break;
            start = Math.Max(end - overlap, start + 1);
        }

        return chunks;
    }

    private static int FindSplitPoint(string text, int start, int end)
    {
        var window = text[start..end];
        foreach (var sep in new[] { "\n\n", "\n", ". ", "? ", "! " })
        {
            var idx = window.LastIndexOf(sep, StringComparison.Ordinal);
            if (idx > window.Length / 3)
                return start + idx + sep.Length;
        }
        return end;
    }

    public static int EstimateTokens(string text) => Math.Max(1, text.Length / 4);
}
