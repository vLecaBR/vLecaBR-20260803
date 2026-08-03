using GestaoColaboradores.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestaoColaboradores.Infrastructure.Data;

/// <summary>
/// Contexto de persistência (EF Core / PostgreSQL).
/// As configurações de mapeamento ficam isoladas em classes
/// <see cref="IEntityTypeConfiguration{TEntity}"/> aplicadas via
/// <c>ApplyConfigurationsFromAssembly</c>, mantendo o contexto enxuto (SRP).
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Unidade> Unidades => Set<Unidade>();
    public DbSet<Colaborador> Colaboradores => Set<Colaborador>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Aplica todas as classes IEntityTypeConfiguration<T> deste assembly.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
