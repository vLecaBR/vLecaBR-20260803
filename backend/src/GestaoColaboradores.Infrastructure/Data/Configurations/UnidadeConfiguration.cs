using GestaoColaboradores.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestaoColaboradores.Infrastructure.Data.Configurations;

/// <summary>
/// Mapeamento Fluent API da entidade <see cref="Unidade"/>.
/// Garante a RN04 (Código único).
/// </summary>
public class UnidadeConfiguration : IEntityTypeConfiguration<Unidade>
{
    public void Configure(EntityTypeBuilder<Unidade> builder)
    {
        builder.ToTable("unidades");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Codigo)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(u => u.Nome)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(u => u.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(u => u.DataCriacao).IsRequired();
        builder.Property(u => u.DataAtualizacao);

        // Propriedade calculada de domínio: não persistir.
        builder.Ignore(u => u.EstaAtiva);

        // RN04: unicidade de Código.
        builder.HasIndex(u => u.Codigo).IsUnique();

        // Relacionamento configurado a partir de Colaborador (ver ColaboradorConfiguration).
    }
}
