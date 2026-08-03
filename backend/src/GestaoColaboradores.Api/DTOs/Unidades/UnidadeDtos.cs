using System.ComponentModel.DataAnnotations;
using GestaoColaboradores.Domain.Enums;

namespace GestaoColaboradores.Api.DTOs.Unidades;

public record CriarUnidadeRequest(
    [Required] string Codigo,
    [Required] string Nome);

public record AtualizarUnidadeRequest(
    [Required] string Nome);

/// <summary>Resumo de um colaborador vinculado a uma unidade.</summary>
public record ColaboradorResumoResponse(
    Guid Id,
    string Codigo,
    string Nome);

/// <summary>
/// Resposta de unidade. Inclui os colaboradores relacionados (conforme a descrição:
/// "listar todas as unidades cadastradas e todos os colaboradores relacionados").
/// </summary>
public record UnidadeResponse(
    Guid Id,
    string Codigo,
    string Nome,
    StatusEnum Status,
    DateTime DataCriacao,
    DateTime? DataAtualizacao,
    IReadOnlyList<ColaboradorResumoResponse> Colaboradores);
