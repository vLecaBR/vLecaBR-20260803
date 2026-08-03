namespace GestaoColaboradores.Application.Security;

/// <summary>
/// Resultado de uma autenticação bem-sucedida: token JWT e sua expiração.
/// </summary>
public record AuthResult(string Token, DateTime ExpiraEm);
