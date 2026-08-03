using System.ComponentModel.DataAnnotations;

namespace GestaoColaboradores.Api.DTOs.Colaboradores;

public record CriarColaboradorRequest(
    [property: Required] string Codigo,
    [property: Required] string Nome,
    [property: Required] Guid UsuarioId,
    [property: Required] Guid UnidadeId);

public record AtualizarColaboradorRequest(
    [property: Required] string Nome);

public record TransferirColaboradorRequest(
    [property: Required] Guid NovaUnidadeId);

/// <summary>
/// Resposta de colaborador. Expõe apenas os identificadores/labels necessários
/// ao frontend, sem vazar a entidade Usuário (e seu hash de senha).
/// </summary>
public record ColaboradorResponse(
    Guid Id,
    string Codigo,
    string Nome,
    Guid UsuarioId,
    string? UsuarioLogin,
    Guid UnidadeId,
    string? UnidadeNome,
    DateTime DataCriacao,
    DateTime? DataAtualizacao);
