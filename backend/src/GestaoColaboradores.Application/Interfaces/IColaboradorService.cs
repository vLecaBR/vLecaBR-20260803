using GestaoColaboradores.Domain.Entities;

namespace GestaoColaboradores.Application.Interfaces;

/// <summary>
/// Casos de uso de Colaborador. Aplica a RN01 (vínculo com usuário existente),
/// a RN02 (bloqueio de unidade inativa) e a RN04 (unicidade de Código).
/// </summary>
public interface IColaboradorService
{
    Task<IEnumerable<Colaborador>> ListarAsync(CancellationToken cancellationToken = default);

    Task<Colaborador> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Colaborador> CriarAsync(string codigo, string nome, Guid usuarioId, Guid unidadeId, CancellationToken cancellationToken = default);

    Task<Colaborador> AtualizarNomeAsync(Guid id, string nome, CancellationToken cancellationToken = default);

    /// <summary>Transfere de unidade respeitando a RN02.</summary>
    Task<Colaborador> TransferirAsync(Guid id, Guid novaUnidadeId, CancellationToken cancellationToken = default);

    /// <summary>Hard Delete: remove fisicamente o registro (<c>Remove()</c>).</summary>
    Task ExcluirAsync(Guid id, CancellationToken cancellationToken = default);
}
