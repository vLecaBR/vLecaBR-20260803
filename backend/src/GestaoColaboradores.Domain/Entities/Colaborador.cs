namespace GestaoColaboradores.Domain.Entities;

/// <summary>
/// Colaborador da organização. Sempre vinculado a um <see cref="Usuario"/> (RN01)
/// e alocado em uma <see cref="Unidade"/>. A transferência entre unidades respeita
/// a RN02 (não é possível alocar em unidade inativa) como guarda de domínio,
/// além da validação na camada de aplicação.
/// </summary>
public class Colaborador : BaseEntity
{
    /// <summary>
    /// Código único de negócio do colaborador (RN04).
    /// </summary>
    public string Codigo { get; private set; }

    /// <summary>
    /// Nome do colaborador.
    /// </summary>
    public string Nome { get; private set; }

    /// <summary>
    /// Chave estrangeira para o usuário vinculado (RN01).
    /// </summary>
    public Guid UsuarioId { get; private set; }

    /// <summary>
    /// Propriedade de navegação para o usuário vinculado.
    /// </summary>
    public Usuario Usuario { get; private set; }

    /// <summary>
    /// Chave estrangeira para a unidade de alocação.
    /// </summary>
    public Guid UnidadeId { get; private set; }

    /// <summary>
    /// Propriedade de navegação para a unidade de alocação.
    /// </summary>
    public Unidade Unidade { get; private set; }

    // Construtor protegido exigido pelo EF Core para materialização.
    protected Colaborador() { }

    public Colaborador(string codigo, string nome, Guid usuarioId, Unidade unidade)
    {
        if (string.IsNullOrWhiteSpace(codigo))
            throw new ArgumentException("O código do colaborador é obrigatório.", nameof(codigo));
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("O nome do colaborador é obrigatório.", nameof(nome));
        if (usuarioId == Guid.Empty)
            throw new ArgumentException("O colaborador precisa estar vinculado a um usuário (RN01).", nameof(usuarioId));
        ArgumentNullException.ThrowIfNull(unidade);

        GarantirUnidadeAtiva(unidade);

        Codigo = codigo.Trim();
        Nome = nome.Trim();
        UsuarioId = usuarioId;
        UnidadeId = unidade.Id;
        Unidade = unidade;
    }

    /// <summary>
    /// Altera o nome do colaborador.
    /// </summary>
    public void AlterarNome(string novoNome)
    {
        if (string.IsNullOrWhiteSpace(novoNome))
            throw new ArgumentException("O nome do colaborador é obrigatório.", nameof(novoNome));

        Nome = novoNome.Trim();
        MarcarComoAtualizada();
    }

    /// <summary>
    /// Transfere o colaborador para outra unidade, respeitando a RN02.
    /// </summary>
    public void TransferirPara(Unidade novaUnidade)
    {
        ArgumentNullException.ThrowIfNull(novaUnidade);
        GarantirUnidadeAtiva(novaUnidade);

        UnidadeId = novaUnidade.Id;
        Unidade = novaUnidade;
        MarcarComoAtualizada();
    }

    /// <summary>
    /// Guarda de domínio da RN02: impede vínculo/transferência para unidade inativa.
    /// </summary>
    private static void GarantirUnidadeAtiva(Unidade unidade)
    {
        if (!unidade.EstaAtiva)
            throw new InvalidOperationException(
                $"Não é permitido alocar colaborador na unidade inativa '{unidade.Codigo}' (RN02).");
    }
}
