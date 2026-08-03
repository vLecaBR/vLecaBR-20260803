using GestaoColaboradores.Domain.Enums;

namespace GestaoColaboradores.Domain.Entities;

/// <summary>
/// Unidade organizacional à qual os colaboradores são alocados.
/// O <see cref="Status"/> é central para a RN02: uma unidade Inativa não pode
/// receber inclusão nem transferência de colaboradores.
/// </summary>
public class Unidade : BaseEntity
{
    /// <summary>
    /// Código único de negócio da unidade (RN04).
    /// </summary>
    public string Codigo { get; private set; }

    /// <summary>
    /// Nome descritivo da unidade.
    /// </summary>
    public string Nome { get; private set; }

    /// <summary>
    /// Status de ativação da unidade.
    /// </summary>
    public StatusEnum Status { get; private set; }

    /// <summary>
    /// Indica se a unidade está apta a receber colaboradores (suporte à RN02).
    /// </summary>
    public bool EstaAtiva => Status == StatusEnum.Ativo;

    // Coleção de navegação (somente leitura para o mundo externo).
    private readonly List<Colaborador> _colaboradores = new();
    public IReadOnlyCollection<Colaborador> Colaboradores => _colaboradores.AsReadOnly();

    // Construtor protegido exigido pelo EF Core para materialização.
    protected Unidade() { }

    public Unidade(string codigo, string nome, StatusEnum status = StatusEnum.Ativo)
    {
        if (string.IsNullOrWhiteSpace(codigo))
            throw new ArgumentException("O código da unidade é obrigatório.", nameof(codigo));
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("O nome da unidade é obrigatório.", nameof(nome));

        Codigo = codigo.Trim();
        Nome = nome.Trim();
        Status = status;
    }

    /// <summary>
    /// Altera o nome da unidade (dado mutável, diferente do Código imutável).
    /// </summary>
    public void AlterarNome(string novoNome)
    {
        if (string.IsNullOrWhiteSpace(novoNome))
            throw new ArgumentException("O nome da unidade é obrigatório.", nameof(novoNome));

        Nome = novoNome.Trim();
        MarcarComoAtualizada();
    }

    public void Ativar()
    {
        Status = StatusEnum.Ativo;
        MarcarComoAtualizada();
    }

    public void Inativar()
    {
        Status = StatusEnum.Inativo;
        MarcarComoAtualizada();
    }
}
