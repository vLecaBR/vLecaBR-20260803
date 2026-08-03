using System.ComponentModel.DataAnnotations;

namespace GestaoColaboradores.Api.DTOs.Auth;

/// <summary>Credenciais de login.</summary>
public record LoginRequest(
    [property: Required] string Login,
    [property: Required] string Senha);
