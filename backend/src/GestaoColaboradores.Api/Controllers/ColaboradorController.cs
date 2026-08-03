using GestaoColaboradores.Api.DTOs.Colaboradores;
using GestaoColaboradores.Api.Mapping;
using GestaoColaboradores.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoColaboradores.Api.Controllers;

[ApiController]
[Route("api/colaboradores")]
[Authorize]
public class ColaboradorController : ControllerBase
{
    private readonly IColaboradorService _service;

    public ColaboradorController(IColaboradorService service) => _service = service;

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ColaboradorResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ColaboradorResponse>>> Listar(CancellationToken ct)
    {
        var colaboradores = await _service.ListarAsync(ct);
        return Ok(colaboradores.Select(c => c.ToResponse()));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ColaboradorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ColaboradorResponse>> ObterPorId(Guid id, CancellationToken ct)
    {
        var colaborador = await _service.ObterPorIdAsync(id, ct);
        return Ok(colaborador.ToResponse());
    }

    [HttpPost]
    [ProducesResponseType(typeof(ColaboradorResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ColaboradorResponse>> Criar(CriarColaboradorRequest request, CancellationToken ct)
    {
        var colaborador = await _service.CriarAsync(request.Codigo, request.Nome, request.UsuarioId, request.UnidadeId, ct);
        return CreatedAtAction(nameof(ObterPorId), new { id = colaborador.Id }, colaborador.ToResponse());
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ColaboradorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ColaboradorResponse>> Atualizar(Guid id, AtualizarColaboradorRequest request, CancellationToken ct)
    {
        var colaborador = await _service.AtualizarNomeAsync(id, request.Nome, ct);
        return Ok(colaborador.ToResponse());
    }

    /// <summary>Transfere o colaborador de unidade (RN02 aplicada no serviço/domínio).</summary>
    [HttpPatch("{id:guid}/transferir")]
    [ProducesResponseType(typeof(ColaboradorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ColaboradorResponse>> Transferir(Guid id, TransferirColaboradorRequest request, CancellationToken ct)
    {
        var colaborador = await _service.TransferirAsync(id, request.NovaUnidadeId, ct);
        return Ok(colaborador.ToResponse());
    }

    /// <summary>Hard Delete: remove fisicamente o colaborador.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Excluir(Guid id, CancellationToken ct)
    {
        await _service.ExcluirAsync(id, ct);
        return NoContent();
    }
}
