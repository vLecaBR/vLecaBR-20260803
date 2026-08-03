using GestaoColaboradores.Domain.Enums;

namespace GestaoColaboradores.Domain.Entities;

/// <summary>
/// Usuário de acesso ao sistema. Ao qual um <see cref="Colaborador"/> se vincula (RN01).
/// A modelagem reforça a RN03: Código e Login são imutáveis após a criação;
/// apenas Senha e Status podem ser alterados, e somente via métodos de comportamento.
/// </summary>
public class Usuario : BaseEntity
{
    /// <summary>
    /// Código único de negócio do usuário (RN04). Imutável após a criação (RN03).
    /// </summary>
    public string Codigo { get; private set; }

    /// <summary>
    /// Login de autenticação. Imutável após a criação (RN03).
    /// </summary>
    public string Login { get; private set; }

    /// <summary>
    /// Hash da senha (ex.: BCrypt). Nunca armazena a senha em texto puro.
    /// </summary>
    public string SenhaHash { get; private set; }

    /// <summary>
    /// Status de ativação do usuário. Permite Soft Delete/Inativação.
    /// </summary>
    public StatusEnum Status { get; private set; }

    // Construtor protegido exigido pelo EF Core para materialização.
    protected Usuario() { }

    public Usuario(string codigo, string login, string senhaHash, StatusEnum status = StatusEnum.Ativo)
    {
        if (string.IsNullOrWhiteSpace(codigo))
            throw new ArgumentException("O código do usuário é obrigatório.", nameof(codigo));
        if (string.IsNullOrWhiteSpace(login))
            throw new ArgumentException("O login do usuário é obrigatório.", nameof(login));
        if (string.IsNullOrWhiteSpace(senhaHash))
            throw new ArgumentException("O hash da senha é obrigatório.", nameof(senhaHash));

        Codigo = codigo.Trim();
        Login = login.Trim();
        SenhaHash = senhaHash;
        Status = status;
    }

    /// <summary>
    /// Atualiza o hash da senha. Único caminho permitido pela RN03 para alterar credencial.
    /// </summary>
    public void AlterarSenha(string novoSenhaHash)
    {
        if (string.IsNullOrWhiteSpace(novoSenhaHash))
            throw new ArgumentException("O hash da senha é obrigatório.", nameof(novoSenhaHash));

        SenhaHash = novoSenhaHash;
        MarcarComoAtualizada();
    }

    /// <summary>
    /// Ativa o usuário.
    /// </summary>
    public void Ativar()
    {
        Status = StatusEnum.Ativo;
        MarcarComoAtualizada();
    }

    /// <summary>
    /// Inativa o usuário (Soft Delete). O registro é preservado no banco.
    /// </summary>
    public void Inativar()
    {
        Status = StatusEnum.Inativo;
        MarcarComoAtualizada();
    }
}
