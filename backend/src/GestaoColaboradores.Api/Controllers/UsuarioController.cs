using GestaoColaboradores.Api.DTOs.Usuarios;
using GestaoColaboradores.Api.Mapping;
using GestaoColaboradores.Application.Interfaces;
using GestaoColaboradores.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestaoColaboradores.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuarioController : ControllerBase
{
    private readonly IUsuarioService _service;

    public UsuarioController(IUsuarioService service) => _service = service;

    /// <summary>Lista usuários. Use <c>?status=Ativo</c> ou <c>?status=Inativo</c> para filtrar.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UsuarioResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UsuarioResponse>>> Listar(
        [FromQuery] StatusEnum? status, CancellationToken ct)
    {
        var usuarios = await _service.ListarAsync(status, ct);
        return Ok(usuarios.Select(u => u.ToResponse()));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UsuarioResponse>> ObterPorId(Guid id, CancellationToken ct)
    {
        var usuario = await _service.ObterPorIdAsync(id, ct);
        return Ok(usuario.ToResponse());
    }

    [HttpPost]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UsuarioResponse>> Criar(CriarUsuarioRequest request, CancellationToken ct)
    {
        var usuario = await _service.CriarAsync(request.Codigo, request.Login, request.Senha, ct);
        return CreatedAtAction(nameof(ObterPorId), new { id = usuario.Id }, usuario.ToResponse());
    }

    /// <summary>Altera apenas a senha (RN03).</summary>
    [HttpPut("{id:guid}/senha")]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UsuarioResponse>> AlterarSenha(Guid id, AlterarSenhaRequest request, CancellationToken ct)
    {
        var usuario = await _service.AlterarSenhaAsync(id, request.NovaSenha, ct);
        return Ok(usuario.ToResponse());
    }

    [HttpPatch("{id:guid}/ativar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Ativar(Guid id, CancellationToken ct)
    {
        await _service.AtivarAsync(id, ct);
        return NoContent();
    }

    /// <summary>Soft Delete: inativa o usuário.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Inativar(Guid id, CancellationToken ct)
    {
        await _service.InativarAsync(id, ct);
        return NoContent();
    }
}
