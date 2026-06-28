using UglyToad.PdfPig;

namespace ChefAI.RagApi.Services;

public class TextExtractionService
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".txt", ".md", ".markdown", ".pdf"
    };

    public bool IsAllowed(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        return AllowedExtensions.Contains(ext);
    }

    public async Task<string> ExtractAsync(IFormFile file, CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        await using var stream = file.OpenReadStream();

        return ext switch
        {
            ".txt" or ".md" or ".markdown" => await ReadTextAsync(stream, cancellationToken),
            ".pdf" => ExtractPdf(stream),
            _ => throw new InvalidOperationException("Unsupported file type."),
        };
    }

    private static async Task<string> ReadTextAsync(Stream stream, CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(stream);
        return (await reader.ReadToEndAsync(cancellationToken)).Trim();
    }

    private static string ExtractPdf(Stream stream)
    {
        using var document = PdfDocument.Open(stream);
        var pages = document.GetPages()
            .Select(p => p.Text)
            .Where(t => !string.IsNullOrWhiteSpace(t));
        return string.Join("\n\n", pages).Trim();
    }
}
