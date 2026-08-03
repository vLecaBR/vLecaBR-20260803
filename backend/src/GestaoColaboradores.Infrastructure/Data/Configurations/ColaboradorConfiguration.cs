using GestaoColaboradores.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GestaoColaboradores.Infrastructure.Data.Configurations;

/// <summary>
/// Mapeamento Fluent API da entidade <see cref="Colaborador"/>.
/// Garante a RN04 (Código único) e configura os relacionamentos com
/// <see cref="Usuario"/> (RN01) e <see cref="Unidade"/> com exclusão restrita:
/// não é possível apagar um Usuário ou Unidade que possua colaboradores.
/// </summary>
public class ColaboradorConfiguration : IEntityTypeConfiguration<Colaborador>
{
    public void Configure(EntityTypeBuilder<Colaborador> builder)
    {
        builder.ToTable("colaboradores");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Codigo)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Nome)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(c => c.DataCriacao).IsRequired();
        builder.Property(c => c.DataAtualizacao);

        // RN04: unicidade de Código.
        builder.HasIndex(c => c.Codigo).IsUnique();

        // RN01: vínculo obrigatório com Usuário. Restrict impede apagar Usuário com colaboradores.
        builder.HasOne(c => c.Usuario)
            .WithMany()
            .HasForeignKey(c => c.UsuarioId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        // Vínculo obrigatório com Unidade. Restrict impede apagar Unidade com colaboradores.
        builder.HasOne(c => c.Unidade)
            .WithMany(u => u.Colaboradores)
            .HasForeignKey(c => c.UnidadeId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
    }
}
