using FluentAssertions;
using GestaoColaboradores.Application.Common.Exceptions;
using GestaoColaboradores.Application.Services;
using GestaoColaboradores.Domain.Entities;
using GestaoColaboradores.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GestaoColaboradores.Tests;

public class ColaboradorServiceTests
{
    private static Usuario NovoUsuario(string codigo = "U1", string login = "user1")
        => new(codigo, login, "$2b$11$abcdefghijklmnopqrstuv");

    [Fact]
    public async Task Criar_DeveVincularColaborador_QuandoUsuarioEUnidadeAtivaExistem()
    {
        using var ctx = TestDbContextFactory.Create();
        var usuario = NovoUsuario();
        var unidade = new Unidade("UN1", "Matriz");
        ctx.AddRange(usuario, unidade);
        await ctx.SaveChangesAsync();
        var service = new ColaboradorService(ctx);

        var colaborador = await service.CriarAsync("C1", "João", usuario.Id, unidade.Id);

        colaborador.Id.Should().NotBeEmpty();
        colaborador.UsuarioId.Should().Be(usuario.Id);
        colaborador.UnidadeId.Should().Be(unidade.Id);
        (await ctx.Colaboradores.CountAsync()).Should().Be(1);
    }

    [Fact] // RN01
    public async Task Criar_DeveLancar_QuandoUsuarioNaoExiste()
    {
        using var ctx = TestDbContextFactory.Create();
        var unidade = new Unidade("UN1", "Matriz");
        ctx.Add(unidade);
        await ctx.SaveChangesAsync();
        var service = new ColaboradorService(ctx);

        var act = () => service.CriarAsync("C1", "João", Guid.NewGuid(), unidade.Id);

        await act.Should().ThrowAsync<BusinessRuleException>().WithMessage("*RN01*");
    }

    [Fact] // RN02
    public async Task Criar_DeveLancar_QuandoUnidadeInativa()
    {
        using var ctx = TestDbContextFactory.Create();
        var usuario = NovoUsuario();
        var unidade = new Unidade("UN1", "Filial", StatusEnum.Inativo);
        ctx.AddRange(usuario, unidade);
        await ctx.SaveChangesAsync();
        var service = new ColaboradorService(ctx);

        var act = () => service.CriarAsync("C1", "João", usuario.Id, unidade.Id);

        await act.Should().ThrowAsync<BusinessRuleException>().WithMessage("*RN02*");
    }

    [Fact] // RN04
    public async Task Criar_DeveLancar_QuandoCodigoDuplicado()
    {
        using var ctx = TestDbContextFactory.Create();
        var usuario = NovoUsuario();
        var unidade = new Unidade("UN1", "Matriz");
        ctx.AddRange(usuario, unidade);
        await ctx.SaveChangesAsync();
        var service = new ColaboradorService(ctx);
        await service.CriarAsync("C1", "João", usuario.Id, unidade.Id);

        var act = () => service.CriarAsync("C1", "Maria", usuario.Id, unidade.Id);

        await act.Should().ThrowAsync<BusinessRuleException>().WithMessage("*RN04*");
    }

    [Fact] // RN02 na transferência
    public async Task Transferir_DeveLancar_QuandoUnidadeDestinoInativa()
    {
        using var ctx = TestDbContextFactory.Create();
        var usuario = NovoUsuario();
        var ativa = new Unidade("UN1", "Matriz");
        var inativa = new Unidade("UN2", "Filial", StatusEnum.Inativo);
        ctx.AddRange(usuario, ativa, inativa);
        await ctx.SaveChangesAsync();
        var service = new ColaboradorService(ctx);
        var colaborador = await service.CriarAsync("C1", "João", usuario.Id, ativa.Id);

        var act = () => service.TransferirAsync(colaborador.Id, inativa.Id);

        await act.Should().ThrowAsync<BusinessRuleException>().WithMessage("*RN02*");
    }

    [Fact] // Hard Delete
    public async Task Excluir_DeveRemoverFisicamente_OColaborador()
    {
        using var ctx = TestDbContextFactory.Create();
        var usuario = NovoUsuario();
        var unidade = new Unidade("UN1", "Matriz");
        ctx.AddRange(usuario, unidade);
        await ctx.SaveChangesAsync();
        var service = new ColaboradorService(ctx);
        var colaborador = await service.CriarAsync("C1", "João", usuario.Id, unidade.Id);

        await service.ExcluirAsync(colaborador.Id);

        (await ctx.Colaboradores.CountAsync()).Should().Be(0);
    }
}
