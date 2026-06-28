using System;
using ChefAI.RagApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Pgvector;

#nullable disable

namespace ChefAI.RagApi.Migrations;

[DbContext(typeof(RagDbContext))]
[Migration("InitialCreate")]
partial class InitialCreate
{
    protected override void BuildTargetModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder
            .HasAnnotation("ProductVersion", "10.0.9")
            .HasAnnotation("Relational:MaxIdentifierLength", 63)
            .HasAnnotation("Npgsql:PostgresExtension:vector", ",,");

        NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

        modelBuilder.Entity("ChefAI.RagApi.Models.Document", b =>
        {
            b.Property<Guid>("Id").ValueGeneratedOnAdd().HasColumnType("uuid");
            b.Property<int>("ChunkCount").HasColumnType("integer");
            b.Property<string>("ContentType").IsRequired().HasMaxLength(128).HasColumnType("character varying(128)");
            b.Property<string>("ErrorMessage").HasMaxLength(2000).HasColumnType("character varying(2000)");
            b.Property<string>("FileName").IsRequired().HasMaxLength(512).HasColumnType("character varying(512)");
            b.Property<long>("FileSize").HasColumnType("bigint");
            b.Property<int>("Status").HasColumnType("integer");
            b.Property<DateTime>("UploadedAt").HasColumnType("timestamp with time zone");
            b.HasKey("Id");
            b.HasIndex("UploadedAt");
            b.ToTable("documents", (string)null);
        });

        modelBuilder.Entity("ChefAI.RagApi.Models.DocumentChunk", b =>
        {
            b.Property<Guid>("Id").ValueGeneratedOnAdd().HasColumnType("uuid");
            b.Property<int>("ChunkIndex").HasColumnType("integer");
            b.Property<string>("Content").IsRequired().HasColumnType("text");
            b.Property<Guid>("DocumentId").HasColumnType("uuid");
            b.Property<Vector>("Embedding").HasColumnType("vector(1536)");
            b.Property<int>("TokenEstimate").HasColumnType("integer");
            b.HasKey("Id");
            b.HasIndex("DocumentId");
            b.ToTable("document_chunks", (string)null);
        });

        modelBuilder.Entity("ChefAI.RagApi.Models.DocumentChunk", b =>
        {
            b.HasOne("ChefAI.RagApi.Models.Document", "Document")
                .WithMany("Chunks")
                .HasForeignKey("DocumentId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();
            b.Navigation("Document");
        });

        modelBuilder.Entity("ChefAI.RagApi.Models.Document", b =>
        {
            b.Navigation("Chunks");
        });
#pragma warning restore 612, 618
    }
}
