using GestaoColaboradores.Application.Security;

namespace GestaoColaboradores.Application.Interfaces;

/// <summary>
/// Autenticação e emissão de tokens JWT.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Valida as credenciais (BCrypt) de um usuário ativo e retorna um token JWT.
    /// </summary>
    /// <exception cref="Common.Exceptions.BusinessRuleException">Credenciais inválidas ou usuário inativo.</exception>
    Task<AuthResult> AutenticarAsync(string login, string senha, CancellationToken cancellationToken = default);
}
