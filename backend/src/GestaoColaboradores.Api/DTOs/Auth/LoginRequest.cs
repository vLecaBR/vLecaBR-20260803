using System.ComponentModel.DataAnnotations;

namespace GestaoColaboradores.Api.DTOs.Auth;

/// <summary>Credenciais de login.</summary>
public record LoginRequest(
    [Required] string Login,
    [Required] string Senha);
