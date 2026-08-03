using System.ComponentModel.DataAnnotations;
using GestaoColaboradores.Domain.Enums;

namespace GestaoColaboradores.Api.DTOs.Usuarios;

/// <summary>Criação de usuário. RN04 (código/login únicos) validada na camada de serviço.</summary>
public record CriarUsuarioRequest(
    [property: Required] string Codigo,
    [property: Required] string Login,
    [property: Required, MinLength(6)] string Senha);

/// <summary>Alteração de senha — único dado de credencial mutável (RN03).</summary>
public record AlterarSenhaRequest(
    [property: Required, MinLength(6)] string NovaSenha);

/// <summary>
/// Resposta de usuário. NÃO inclui SenhaHash — o hash jamais é exposto no JSON.
/// </summary>
public record UsuarioResponse(
    Guid Id,
    string Codigo,
    string Login,
    StatusEnum Status,
    DateTime DataCriacao,
    DateTime? DataAtualizacao);
