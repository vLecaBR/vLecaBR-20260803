using FluentAssertions;
using GestaoColaboradores.Application.Common.Exceptions;
using GestaoColaboradores.Application.Services;
using GestaoColaboradores.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GestaoColaboradores.Tests;

public class UsuarioServiceTests
{
    [Fact]
    public async Task Criar_DeveHashearSenha_ENuncaArmazenarTextoPuro()
    {
        using var ctx = TestDbContextFactory.Create();
        var service = new UsuarioService(ctx);

        var usuario = await service.CriarAsync("U1", "joao", "Senha@123");

        usuario.SenhaHash.Should().NotBe("Senha@123");
        BCrypt.Net.BCrypt.Verify("Senha@123", usuario.SenhaHash).Should().BeTrue();
    }

    [Fact] // RN04
    public async Task Criar_DeveLancar_QuandoLoginOuCodigoDuplicado()
    {
        using var ctx = TestDbContextFactory.Create();
        var service = new UsuarioService(ctx);
        await service.CriarAsync("U1", "joao", "Senha@123");

        var act = () => service.CriarAsync("U1", "outro", "Senha@123");

        await act.Should().ThrowAsync<BusinessRuleException>().WithMessage("*RN04*");
    }

    [Fact] // Soft Delete
    public async Task Inativar_DevePreservarRegistro_EAlterarStatus()
    {
        using var ctx = TestDbContextFactory.Create();
        var service = new UsuarioService(ctx);
        var usuario = await service.CriarAsync("U1", "joao", "Senha@123");

        await service.InativarAsync(usuario.Id);

        var persistido = await ctx.Usuarios.FindAsync(usuario.Id);
        persistido.Should().NotBeNull();
        persistido!.Status.Should().Be(StatusEnum.Inativo);
    }

    [Fact] // Consulta por status
    public async Task Listar_DeveFiltrarPorStatus_QuandoInformado()
    {
        using var ctx = TestDbContextFactory.Create();
        var service = new UsuarioService(ctx);
        var ativo = await service.CriarAsync("U1", "ativo", "Senha@123");
        var inativoBase = await service.CriarAsync("U2", "inativo", "Senha@123");
        await service.InativarAsync(inativoBase.Id);

        var ativos = await service.ListarAsync(StatusEnum.Ativo);
        var inativos = await service.ListarAsync(StatusEnum.Inativo);
        var todos = await service.ListarAsync();

        ativos.Should().ContainSingle(u => u.Id == ativo.Id);
        inativos.Should().ContainSingle(u => u.Id == inativoBase.Id);
        todos.Should().HaveCount(2);
    }

    [Fact] // RN03: alterar senha gera novo hash válido
    public async Task AlterarSenha_DeveAtualizarHash()
    {
        using var ctx = TestDbContextFactory.Create();
        var service = new UsuarioService(ctx);
        var usuario = await service.CriarAsync("U1", "joao", "Senha@123");
        var hashOriginal = usuario.SenhaHash;

        await service.AlterarSenhaAsync(usuario.Id, "NovaSenha@456");

        var persistido = await ctx.Usuarios.FindAsync(usuario.Id);
        persistido!.SenhaHash.Should().NotBe(hashOriginal);
        BCrypt.Net.BCrypt.Verify("NovaSenha@456", persistido.SenhaHash).Should().BeTrue();
    }
}
