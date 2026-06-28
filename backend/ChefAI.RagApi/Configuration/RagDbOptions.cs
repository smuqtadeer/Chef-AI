namespace ChefAI.RagApi.Configuration;

public class RagDbOptions
{
    public const string SectionName = "RagDb";

    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 5432;
    public string Database { get; set; } = "chefai_rag";
    public string Username { get; set; } = "postgres";
    public string Password { get; set; } = string.Empty;
}
