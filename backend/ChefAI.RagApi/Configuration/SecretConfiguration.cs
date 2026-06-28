using ChefAI.RagApi.Configuration;

namespace ChefAI.RagApi.Configuration;

public static class SecretConfiguration
{
    public static string? GetOpenRouterApiKey(IConfiguration configuration)
        => FirstNonEmpty(
            Environment.GetEnvironmentVariable("OPENROUTER_API_KEY"),
            configuration["OpenRouter:ApiKey"]);

    public static string? GetDbPassword(IConfiguration configuration)
        => FirstNonEmpty(
            Environment.GetEnvironmentVariable("RAG_DB_PASSWORD"),
            configuration["RagDb:Password"]);

    public static string BuildConnectionString(IConfiguration configuration)
    {
        var db = configuration.GetSection(RagDbOptions.SectionName).Get<RagDbOptions>()
            ?? new RagDbOptions();
        var password = GetDbPassword(configuration);

        if (string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException("Set RAG_DB_PASSWORD in backend/ChefAI.RagApi/.env (see .env.example).");

        return $"Host={db.Host};Port={db.Port};Database={db.Database};Username={db.Username};Password={password}";
    }

    public static void ValidateRequiredSecrets(IConfiguration configuration)
    {
        if (string.IsNullOrWhiteSpace(GetOpenRouterApiKey(configuration)))
            throw new InvalidOperationException("Set OPENROUTER_API_KEY in backend/ChefAI.RagApi/.env (see .env.example).");

        _ = BuildConnectionString(configuration);
    }

    private static string? FirstNonEmpty(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value)) return value;
        }
        return null;
    }
}
