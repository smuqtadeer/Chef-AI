namespace ChefAI.RagApi.Configuration;

/// <summary>
/// Loads KEY=VALUE pairs from a gitignored .env file into the process environment.
/// Does not overwrite variables already set in the shell.
/// </summary>
public static class EnvFileLoader
{
    public static void Load(string? path = null)
    {
        path ??= FindEnvFile();
        if (path is null || !File.Exists(path)) return;

        foreach (var rawLine in File.ReadLines(path))
        {
            var line = rawLine.Trim();
            if (line.Length == 0 || line.StartsWith('#')) continue;

            var eq = line.IndexOf('=');
            if (eq <= 0) continue;

            var key = line[..eq].Trim();
            var value = line[(eq + 1)..].Trim();

            if (value.Length >= 2 &&
                ((value.StartsWith('"') && value.EndsWith('"')) ||
                 (value.StartsWith('\'') && value.EndsWith('\''))))
            {
                value = value[1..^1];
            }

            if (string.IsNullOrEmpty(key)) continue;

            // .env file takes precedence over shell vars (avoids stale OPENROUTER_API_KEY=placeholder)
            Environment.SetEnvironmentVariable(key, value);
        }
    }

    private static string? FindEnvFile()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null)
        {
            var candidate = Path.Combine(dir.FullName, ".env");
            if (File.Exists(candidate)) return candidate;
            if (File.Exists(Path.Combine(dir.FullName, "ChefAI.RagApi.csproj"))) break;
            dir = dir.Parent;
        }

        return null;
    }
}
