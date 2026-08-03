using System.ComponentModel.DataAnnotations;

namespace GestaoColaboradores.Api.DTOs.Colaboradores;

public record CriarColaboradorRequest(
    [Required] string Codigo,
    [Required] string Nome,
    [Required] Guid UsuarioId,
    [Required] Guid UnidadeId);

public record AtualizarColaboradorRequest(
    [Required] string Nome);

public record TransferirColaboradorRequest(
    [Required] Guid NovaUnidadeId);

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
