namespace GestaoColaboradores.Domain.Enums;

/// <summary>
/// Representa o estado de ativação de entidades do domínio (Usuário, Unidade).
/// Usado para atender RN02 (bloqueio de unidade inativa) e RN03 (alteração de status).
/// </summary>
public enum StatusEnum
{
    Inativo = 0,
    Ativo = 1
}
