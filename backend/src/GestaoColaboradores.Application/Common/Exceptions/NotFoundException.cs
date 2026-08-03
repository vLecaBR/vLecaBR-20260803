namespace GestaoColaboradores.Application.Common.Exceptions;

/// <summary>
/// Lançada quando um recurso solicitado não é encontrado.
/// Mapeada para HTTP 404 na Fase 4.
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }

    public static NotFoundException Para(string recurso, object chave)
        => new($"{recurso} não encontrado(a) para o identificador '{chave}'.");
}
