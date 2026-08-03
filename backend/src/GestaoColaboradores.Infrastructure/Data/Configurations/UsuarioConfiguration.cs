using GestaoColaboradores.Domain.Entities;
using GestaoColaboradores.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestaoColaboradores.Infrastructure.Data.Configurations;

/// <summary>
/// Mapeamento Fluent API da entidade <see cref="Usuario"/>.
/// Garante a RN04 (Código e Login únicos) e semeia o Usuário Master.
/// </summary>
public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    // Identidade e credenciais fixas do Master (determinísticas para o seed/migration).
    public static readonly Guid MasterId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly DateTime SeedDate = new(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    // Hash BCrypt ($2b$) da senha "Master@123" — verificável na Fase 3 (BCrypt.Net-Next).
    private const string MasterSenhaHash = "$2b$11$HDJE/lXB4PZaVqvoDeDnaO.nDxrUrbGCApakyfVPFmYHRPECdytZW";

    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Codigo)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Login)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(u => u.SenhaHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(u => u.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(u => u.DataCriacao).IsRequired();
        builder.Property(u => u.DataAtualizacao);

        // RN04: unicidade de Código e Login.
        builder.HasIndex(u => u.Codigo).IsUnique();
        builder.HasIndex(u => u.Login).IsUnique();

        // Seed do Usuário Master (objeto anônimo evita depender do construtor de domínio).
        builder.HasData(new
        {
            Id = MasterId,
            Codigo = "MASTER",
            Login = "master",
            SenhaHash = MasterSenhaHash,
            Status = StatusEnum.Ativo,
            DataCriacao = SeedDate,
            DataAtualizacao = (DateTime?)null
        });
    }
}
