using GestaoColaboradores.Api.DTOs.Colaboradores;
using GestaoColaboradores.Api.DTOs.Unidades;
using GestaoColaboradores.Api.DTOs.Usuarios;
using GestaoColaboradores.Domain.Entities;

namespace GestaoColaboradores.Api.Mapping;

/// <summary>
/// Conversões entidade de domínio → DTO de resposta.
/// Centralizadas aqui para garantir que nenhuma entidade (nem o SenhaHash) vaze na API.
/// </summary>
public static class DtoMappings
{
    public static UsuarioResponse ToResponse(this Usuario u) =>
        new(u.Id, u.Codigo, u.Login, u.Status, u.DataCriacao, u.DataAtualizacao);

    public static UnidadeResponse ToResponse(this Unidade u) =>
        new(u.Id, u.Codigo, u.Nome, u.Status, u.DataCriacao, u.DataAtualizacao,
            u.Colaboradores
                .Select(c => new ColaboradorResumoResponse(c.Id, c.Codigo, c.Nome))
                .ToList());

    public static ColaboradorResponse ToResponse(this Colaborador c) =>
        new(c.Id, c.Codigo, c.Nome,
            c.UsuarioId, c.Usuario?.Login,
            c.UnidadeId, c.Unidade?.Nome,
            c.DataCriacao, c.DataAtualizacao);
}
