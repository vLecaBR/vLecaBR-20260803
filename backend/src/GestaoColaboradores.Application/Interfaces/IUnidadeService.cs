using GestaoColaboradores.Domain.Entities;

namespace GestaoColaboradores.Application.Interfaces;

/// <summary>
/// Casos de uso de Unidade. Respeita a RN04 (unicidade de Código).
/// </summary>
public interface IUnidadeService
{
    Task<IEnumerable<Unidade>> ListarAsync(CancellationToken cancellationToken = default);

    Task<Unidade> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Unidade> CriarAsync(string codigo, string nome, CancellationToken cancellationToken = default);

    Task<Unidade> AtualizarNomeAsync(Guid id, string nome, CancellationToken cancellationToken = default);

    Task AtivarAsync(Guid id, CancellationToken cancellationToken = default);

    Task InativarAsync(Guid id, CancellationToken cancellationToken = default);
}
