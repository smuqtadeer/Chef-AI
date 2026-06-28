using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Pgvector;

#nullable disable

namespace ChefAI.RagApi.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterDatabase()
            .Annotation("Npgsql:PostgresExtension:vector", ",,");

        migrationBuilder.CreateTable(
            name: "documents",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                FileName = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: false),
                ContentType = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                FileSize = table.Column<long>(type: "bigint", nullable: false),
                Status = table.Column<int>(type: "integer", nullable: false),
                ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                ChunkCount = table.Column<int>(type: "integer", nullable: false),
                UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_documents", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "document_chunks",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                DocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                ChunkIndex = table.Column<int>(type: "integer", nullable: false),
                Content = table.Column<string>(type: "text", nullable: false),
                TokenEstimate = table.Column<int>(type: "integer", nullable: false),
                Embedding = table.Column<Vector>(type: "vector(1536)", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_document_chunks", x => x.Id);
                table.ForeignKey(
                    name: "FK_document_chunks_documents_DocumentId",
                    column: x => x.DocumentId,
                    principalTable: "documents",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_document_chunks_DocumentId",
            table: "document_chunks",
            column: "DocumentId");

        migrationBuilder.CreateIndex(
            name: "IX_documents_UploadedAt",
            table: "documents",
            column: "UploadedAt");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "document_chunks");
        migrationBuilder.DropTable(name: "documents");
    }
}
