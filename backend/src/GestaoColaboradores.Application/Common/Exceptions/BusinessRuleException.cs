namespace GestaoColaboradores.Application.Common.Exceptions;

/// <summary>
/// Lançada quando uma regra de negócio (RN01–RN04) é violada.
/// Mapeada para HTTP 400/409 na Fase 4.
/// </summary>
public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}
