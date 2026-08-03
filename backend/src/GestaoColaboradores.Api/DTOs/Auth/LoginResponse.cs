namespace GestaoColaboradores.Api.DTOs.Auth;

/// <summary>Token JWT emitido após autenticação bem-sucedida.</summary>
public record LoginResponse(string Token, DateTime ExpiraEm, string TokenType = "Bearer");
