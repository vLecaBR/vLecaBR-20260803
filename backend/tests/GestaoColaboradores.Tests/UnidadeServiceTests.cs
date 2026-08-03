using FluentAssertions;
using GestaoColaboradores.Application.Common.Exceptions;
using GestaoColaboradores.Application.Services;
using GestaoColaboradores.Domain.Enums;

namespace GestaoColaboradores.Tests;

public class UnidadeServiceTests
{
    [Fact]
    public async Task Criar_DeveCriarUnidadeAtivaPorPadrao()
    {
        using var ctx = TestDbContextFactory.Create();
        var service = new UnidadeService(ctx);

        var unidade = await service.CriarAsync("UN1", "Matriz");

        unidade.Status.Should().Be(StatusEnum.Ativo);
        unidade.EstaAtiva.Should().BeTrue();
    }

    [Fact] // RN04
    public async Task Criar_DeveLancar_QuandoCodigoDuplicado()
    {
        using var ctx = TestDbContextFactory.Create();
        var service = new UnidadeService(ctx);
        await service.CriarAsync("UN1", "Matriz");

        var act = () => service.CriarAsync("UN1", "Outra");

        await act.Should().ThrowAsync<BusinessRuleException>().WithMessage("*RN04*");
    }

    [Fact] // RN02 (base): inativar deixa a unidade não apta a receber colaboradores
    public async Task Inativar_DeveTornarUnidadeNaoApta()
    {
        using var ctx = TestDbContextFactory.Create();
        var service = new UnidadeService(ctx);
        var unidade = await service.CriarAsync("UN1", "Matriz");

        await service.InativarAsync(unidade.Id);

        var persistida = await service.ObterPorIdAsync(unidade.Id);
        persistida.EstaAtiva.Should().BeFalse();
    }
}
