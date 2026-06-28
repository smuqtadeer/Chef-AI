using ChefAI.RagApi.Configuration;
using ChefAI.RagApi.Data;
using ChefAI.RagApi.DTOs;
using ChefAI.RagApi.Services;
using Microsoft.EntityFrameworkCore;

// Load gitignored .env into environment (does not overwrite existing shell vars)
EnvFileLoader.Load();

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://127.0.0.1:5280");

builder.Services.Configure<OpenRouterOptions>(builder.Configuration.GetSection(OpenRouterOptions.SectionName));
builder.Services.Configure<RagDbOptions>(builder.Configuration.GetSection(RagDbOptions.SectionName));
builder.Services.Configure<RagOptions>(builder.Configuration.GetSection(RagOptions.SectionName));

try
{
    SecretConfiguration.ValidateRequiredSecrets(builder.Configuration);
}
catch (InvalidOperationException ex)
{
    Console.Error.WriteLine(ex.Message);
    return;
}

var connectionString = SecretConfiguration.BuildConnectionString(builder.Configuration);

builder.Services.AddDbContext<RagDbContext>(options =>
    options.UseNpgsql(connectionString, o => o.UseVector()));

builder.Services.AddHttpClient<OpenRouterEmbeddingService>();
builder.Services.AddScoped<TextExtractionService>();
builder.Services.AddScoped<ChunkingService>();
builder.Services.AddScoped<DocumentIngestionService>();
builder.Services.AddScoped<VectorSearchService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(
                "http://localhost:5173", "http://127.0.0.1:5173",
                "http://localhost:5181", "http://127.0.0.1:5181")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RagDbContext>();
    await db.Database.MigrateAsync();
    await db.Database.ExecuteSqlRawAsync(
        "CREATE INDEX IF NOT EXISTS ix_document_chunks_embedding_hnsw ON document_chunks USING hnsw (\"Embedding\" vector_cosine_ops);");
}

app.UseCors();

async Task<IResult> HealthCheck(RagDbContext db, IConfiguration config)
{
    var openRouterConfigured = !string.IsNullOrWhiteSpace(SecretConfiguration.GetOpenRouterApiKey(config));
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        return Results.Ok(new
        {
            status = canConnect && openRouterConfigured ? "ok" : "degraded",
            db = canConnect ? "connected" : "unavailable",
            openrouter = openRouterConfigured ? "configured" : "missing_key",
        });
    }
    catch
    {
        return Results.Ok(new { status = "degraded", db = "unavailable", openrouter = openRouterConfigured ? "configured" : "missing_key" });
    }
}

app.MapGet("/health", HealthCheck);
app.MapGet("/api/health", HealthCheck);

app.MapGet("/api/documents", async (DocumentIngestionService service, CancellationToken ct) =>
    Results.Ok(await service.ListAsync(ct)));

app.MapGet("/api/documents/{id:guid}", async (Guid id, DocumentIngestionService service, CancellationToken ct) =>
{
    var doc = await service.GetAsync(id, ct);
    return doc is null ? Results.NotFound() : Results.Ok(doc);
});

app.MapPost("/api/documents", async (HttpRequest request, DocumentIngestionService service, CancellationToken ct) =>
{
    if (!request.HasFormContentType)
        return Results.BadRequest(new { error = "Expected multipart form data." });

    var file = request.Form.Files.FirstOrDefault();
    if (file is null)
        return Results.BadRequest(new { error = "No file uploaded." });

    try
    {
        var result = await service.IngestAsync(file, ct);
        return Results.Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
    catch
    {
        return Results.Problem("Document processing failed.", statusCode: 500);
    }
});

app.MapDelete("/api/documents/{id:guid}", async (Guid id, DocumentIngestionService service, CancellationToken ct) =>
    await service.DeleteAsync(id, ct) ? Results.NoContent() : Results.NotFound());

app.MapPost("/api/search", async (SearchRequest request, VectorSearchService service, CancellationToken ct) =>
{
    try
    {
        return Results.Ok(await service.SearchAsync(request.Query, request.TopK, ct));
    }
    catch
    {
        return Results.Problem("Search unavailable.", statusCode: 503);
    }
});

app.Run();
