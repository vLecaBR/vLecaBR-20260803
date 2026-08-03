using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GestaoColaboradores.Infrastructure.Data;

/// <summary>
/// Fábrica usada pelas ferramentas de design do EF Core (dotnet ef migrations/database update)
/// para instanciar o contexto sem depender do projeto de API em tempo de execução.
/// A string de conexão aponta para o PostgreSQL do docker-compose (ambiente local).
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=gestao_colaboradores;Username=gestao;Password=gestao123";

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new ApplicationDbContext(options);
    }
}
