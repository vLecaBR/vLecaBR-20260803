using GestaoColaboradores.Application.Common.Exceptions;
using GestaoColaboradores.Application.Interfaces;
using GestaoColaboradores.Domain.Entities;
using GestaoColaboradores.Domain.Enums;
using GestaoColaboradores.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace GestaoColaboradores.Application.Services;

/// <summary>
/// Casos de uso de Usuário. A RN03 é garantida por construção: não há caminho
/// para alterar Código/Login (a entidade não os expõe e o serviço não os aceita).
/// A exclusão é Soft Delete via <c>usuario.Inativar()</c>.
/// </summary>
public class UsuarioService : IUsuarioService
{
    private readonly ApplicationDbContext _context;

    public UsuarioService(ApplicationDbContext context) => _context = context;

    public async Task<IEnumerable<Usuario>> ListarAsync(StatusEnum? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Usuarios.AsNoTracking().AsQueryable();

        // Consulta apenas por status quando informado.
        if (status is not null)
            query = query.Where(u => u.Status == status);

        return await query.ToListAsync(cancellationToken);
    }

    public async Task<Usuario> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id, cancellationToken)
           ?? throw NotFoundException.Para("Usuário", id);

    public async Task<Usuario> CriarAsync(string codigo, string login, string senha, CancellationToken cancellationToken = default)
    {
        // RN04: unicidade de Código e Login.
        var duplicado = await _context.Usuarios
            .AnyAsync(u => u.Codigo == codigo || u.Login == login, cancellationToken);
        if (duplicado)
            throw new BusinessRuleException("Já existe um usuário com o mesmo Código ou Login (RN04).");

        var senhaHash = BCrypt.Net.BCrypt.HashPassword(senha, workFactor: 11);

        // Estado válido garantido pelo construtor rico (Fase 1).
        var usuario = new Usuario(codigo, login, senhaHash);

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync(cancellationToken);
        return usuario;
    }

    public async Task<Usuario> AlterarSenhaAsync(Guid id, string novaSenha, CancellationToken cancellationToken = default)
    {
        var usuario = await ObterRastreadoAsync(id, cancellationToken);

        var novoHash = BCrypt.Net.BCrypt.HashPassword(novaSenha, workFactor: 11);
        usuario.AlterarSenha(novoHash); // método de comportamento do domínio

        await _context.SaveChangesAsync(cancellationToken);
        return usuario;
    }

    public async Task AtivarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var usuario = await ObterRastreadoAsync(id, cancellationToken);
        usuario.Ativar();
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task InativarAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var usuario = await ObterRastreadoAsync(id, cancellationToken);
        usuario.Inativar(); // Soft Delete
        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<Usuario> ObterRastreadoAsync(Guid id, CancellationToken cancellationToken)
        => await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id, cancellationToken)
           ?? throw NotFoundException.Para("Usuário", id);
}
