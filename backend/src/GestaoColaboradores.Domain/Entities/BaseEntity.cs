namespace GestaoColaboradores.Domain.Entities;

/// <summary>
/// Classe base abstrata para todas as entidades de domínio (princípio DRY).
/// Centraliza a identidade (Id) e os campos de auditoria de criação/atualização,
/// evitando repetição em cada entidade concreta.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// Identificador único global. Gerado no momento da construção da entidade.
    /// </summary>
    public Guid Id { get; protected set; }

    /// <summary>
    /// Data/hora (UTC) em que a entidade foi criada. Imutável após a criação.
    /// </summary>
    public DateTime DataCriacao { get; protected set; }

    /// <summary>
    /// Data/hora (UTC) da última atualização. Nula enquanto a entidade não sofrer alterações.
    /// </summary>
    public DateTime? DataAtualizacao { get; protected set; }

    protected BaseEntity()
    {
        Id = Guid.NewGuid();
        DataCriacao = DateTime.UtcNow;
    }

    /// <summary>
    /// Marca a entidade como atualizada. Deve ser chamado por qualquer método
    /// que altere o estado da entidade, garantindo consistência da auditoria.
    /// </summary>
    protected void MarcarComoAtualizada()
    {
        DataAtualizacao = DateTime.UtcNow;
    }
}
