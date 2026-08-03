using GestaoColaboradores.Api.DTOs.Unidades;
using GestaoColaboradores.Api.Mapping;
using GestaoColaboradores.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoColaboradores.Api.Controllers;

[ApiController]
[Route("api/unidades")]
[Authorize]
public class UnidadeController : ControllerBase
{
    private readonly IUnidadeService _service;

    public UnidadeController(IUnidadeService service) => _service = service;

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UnidadeResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UnidadeResponse>>> Listar(CancellationToken ct)
    {
        var unidades = await _service.ListarAsync(ct);
        return Ok(unidades.Select(u => u.ToResponse()));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UnidadeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UnidadeResponse>> ObterPorId(Guid id, CancellationToken ct)
    {
        var unidade = await _service.ObterPorIdAsync(id, ct);
        return Ok(unidade.ToResponse());
    }

    [HttpPost]
    [ProducesResponseType(typeof(UnidadeResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UnidadeResponse>> Criar(CriarUnidadeRequest request, CancellationToken ct)
    {
        var unidade = await _service.CriarAsync(request.Codigo, request.Nome, ct);
        return CreatedAtAction(nameof(ObterPorId), new { id = unidade.Id }, unidade.ToResponse());
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UnidadeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UnidadeResponse>> Atualizar(Guid id, AtualizarUnidadeRequest request, CancellationToken ct)
    {
        var unidade = await _service.AtualizarNomeAsync(id, request.Nome, ct);
        return Ok(unidade.ToResponse());
    }

    [HttpPatch("{id:guid}/ativar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Ativar(Guid id, CancellationToken ct)
    {
        await _service.AtivarAsync(id, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Inativar(Guid id, CancellationToken ct)
    {
        await _service.InativarAsync(id, ct);
        return NoContent();
    }
}
