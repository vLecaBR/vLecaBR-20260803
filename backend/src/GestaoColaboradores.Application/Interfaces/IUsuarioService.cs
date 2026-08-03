using GestaoColaboradores.Domain.Entities;
using GestaoColaboradores.Domain.Enums;

namespace GestaoColaboradores.Application.Interfaces;

/// <summary>
/// Casos de uso de Usuário. Respeita a RN03 (não expõe alteração de Código/Login)
/// e a RN04 (unicidade de Código e Login na criação).
/// </summary>
public interface IUsuarioService
{
    /// <summary>
    /// Lista usuários. Quando <paramref name="status"/> é informado, filtra por status
    /// (consulta apenas por status); quando nulo, retorna todos.
    /// </summary>
    Task<IEnumerable<Usuario>> ListarAsync(StatusEnum? status = null, CancellationToken cancellationToken = default);

    Task<Usuario> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Usuario> CriarAsync(string codigo, string login, string senha, CancellationToken cancellationToken = default);

    /// <summary>Único caminho de alteração de credencial permitido pela RN03.</summary>
    Task<Usuario> AlterarSenhaAsync(Guid id, string novaSenha, CancellationToken cancellationToken = default);

    Task AtivarAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>Soft Delete: invoca <c>usuario.Inativar()</c> (o registro é preservado).</summary>
    Task InativarAsync(Guid id, CancellationToken cancellationToken = default);
}
