using GestaoColaboradores.Application.Common.Exceptions;
using GestaoColaboradores.Application.Interfaces;
using GestaoColaboradores.Domain.Entities;
using GestaoColaboradores.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestaoColaboradores.Application.Services;

/// <summary>
/// Casos de uso de Colaborador. Concentra a aplicação da RN01 (usuário existente),
/// RN02 (unidade ativa) e RN04 (código único). A exclusão é Hard Delete (<c>Remove()</c>).
/// A RN02 é reforçada em dois níveis: aqui (feedback claro) e no domínio (guarda final).
/// </summary>
public class ColaboradorService : IColaboradorService
{
    private readonly ApplicationDbContext _context;

    public ColaboradorService(ApplicationDbContext context) => _context = context;

    public async Task<IEnumerable<Colaborador>> ListarAsync(CancellationToken cancellationToken = default)
        => await _context.Colaboradores
            .AsNoTracking()
            .Include(c => c.Unidade)
            .Include(c => c.Usuario)
            .ToListAsync(cancellationToken);

    public async Task<Colaborador> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Colaboradores
            .AsNoTracking()
            .Include(c => c.Unidade)
            .Include(c => c.Usuario)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
           ?? throw NotFoundException.Para("Colaborador", id);

    public async Task<Colaborador> CriarAsync(string codigo, string nome, Guid usuarioId, Guid unidadeId, CancellationToken cancellationToken = default)
    {
        // RN04: unicidade de Código.
        var duplicado = await _context.Colaboradores.AnyAsync(c => c.Codigo == codigo, cancellationToken);
        if (duplicado)
            throw new BusinessRuleException("Já existe um colaborador com o mesmo Código (RN04).");

        // RN01: o usuário precisa existir.
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == usuarioId, cancellationToken);
        if (!usuarioExiste)
            throw new BusinessRuleException("Usuário informado não existe (RN01).");

        // A unidade precisa existir para vincular.
        var unidade = await _context.Unidades.FirstOrDefaultAsync(u => u.Id == unidadeId, cancellationToken)
                      ?? throw NotFoundException.Para("Unidade", unidadeId);

        // RN02: validação explícita antes de delegar ao construtor de domínio (que também guarda).
        if (!unidade.EstaAtiva)
            throw new BusinessRuleException($"Não é permitido vincular colaborador à unidade inativa '{unidade.Codigo}' (RN02).");

        var colaborador = new Colaborador(codigo, nome, usuarioId, unidade);

        _context.Colaboradores.Add(colaborador);
        await _context.SaveChangesAsync(cancellationToken);
        return colaborador;
    }

    public async Task<Colaborador> AtualizarNomeAsync(Guid id, string nome, CancellationToken cancellationToken = default)
    {
        var colaborador = await ObterRastreadoAsync(id, cancellationToken);
        colaborador.AlterarNome(nome);
        await _context.SaveChangesAsync(cancellationToken);
        return colaborador;
    }

    public async Task<Colaborador> TransferirAsync(Guid id, Guid novaUnidadeId, CancellationToken cancellationToken = default)
    {
        var colaborador = await ObterRastreadoAsync(id, cancellationToken);

        var novaUnidade = await _context.Unidades.FirstOrDefaultAsync(u => u.Id == novaUnidadeId, cancellationToken)
                          ?? throw NotFoundException.Para("Unidade", novaUnidadeId);

        // RN02: validação explícita (o domínio também barra via TransferirPara).
        if (!novaUnidade.EstaAtiva)
            throw new BusinessRuleException($"Não é permitido transferir colaborador para a unidade inativa '{novaUnidade.Codigo}' (RN02).");

        colaborador.TransferirPara(novaUnidade); // método de comportamento do domínio
        await _context.SaveChangesAsync(cancellationToken);
        return colaborador;
    }

    public async Task ExcluirAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var colaborador = await ObterRastreadoAsync(id, cancellationToken);
        _context.Colaboradores.Remove(colaborador); // Hard Delete
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<Colaborador> ObterRastreadoAsync(Guid id, CancellationToken cancellationToken)
        => await _context.Colaboradores.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
           ?? throw NotFoundException.Para("Colaborador", id);
}
