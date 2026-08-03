using GestaoColaboradores.Application.Common.Exceptions;
using GestaoColaboradores.Application.Interfaces;
using GestaoColaboradores.Domain.Entities;
using GestaoColaboradores.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestaoColaboradores.Application.Services;

/// <summary>
/// Casos de uso de Unidade. Garante a RN04 (unicidade de Código) e delega
/// as mutações aos métodos de comportamento da entidade.
/// </summary>
public class UnidadeService : IUnidadeService
{
    private readonly ApplicationDbContext _context;

    public UnidadeService(ApplicationDbContext context) => _context = context;

    public async Task<IEnumerable<Unidade>> ListarAsync(CancellationToken cancellationToken = default)
        => await _context.Unidades
            .AsNoTracking()
            .Include(u => u.Colaboradores)
            .ToListAsync(cancellationToken);

    public async Task<Unidade> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Unidades
            .AsNoTracking()
            .Include(u => u.Colaboradores)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken)
           ?? throw NotFoundException.Para("Unidade", id);

    public async Task<Unidade> CriarAsync(string codigo, string nome, CancellationToken cancellationToken = default)
    {
        // RN04: unicidade de Código.
        var duplicado = await _context.Unidades.AnyAsync(u => u.Codigo == codigo, cancellationToken);
        if (duplicado)
            throw new BusinessRuleException("Já existe uma unidade com o mesmo Código (RN04).");

        var unidade = new Unidade(codigo, nome);
        _context.Unidades.Add(unidade);
        await _context.SaveChangesAsync(cancellationToken);
        return unidade;
    }

    public async Task<Unidade> AtualizarNomeAsync(Guid id, string nome, CancellationToken cancellationToken = default)
    {
        var unidade = await ObterRastreadaAsync(id, cancellationToken);
        unidade.AlterarNome(nome);
        await _context.SaveChangesAsync(cancellationToken);
        return unidade;
    }

    public async Task AtivarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var unidade = await ObterRastreadaAsync(id, cancellationToken);
        unidade.Ativar();
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task InativarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var unidade = await ObterRastreadaAsync(id, cancellationToken);
        unidade.Inativar();
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<Unidade> ObterRastreadaAsync(Guid id, CancellationToken cancellationToken)
        => await _context.Unidades.FirstOrDefaultAsync(u => u.Id == id, cancellationToken)
           ?? throw NotFoundException.Para("Unidade", id);
}
