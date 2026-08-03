using GestaoColaboradores.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GestaoColaboradores.Api.Middleware;

/// <summary>
/// Handler global de exceções (.NET 8). Traduz as exceções de domínio para
/// respostas <see cref="ProblemDetails"/> limpas, sem vazar stack trace ao cliente:
///  - <see cref="NotFoundException"/>      → 404 Not Found
///  - <see cref="BusinessRuleException"/>  → 400 Bad Request
///  - qualquer outra                       → 500 Internal Server Error (mensagem genérica)
/// </summary>
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) => _logger = logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title) = exception switch
        {
            NotFoundException     => (StatusCodes.Status404NotFound, "Recurso não encontrado"),
            BusinessRuleException => (StatusCodes.Status400BadRequest, "Violação de regra de negócio"),
            _                     => (StatusCodes.Status500InternalServerError, "Erro interno do servidor")
        };

        // Stack trace vai apenas para o log do servidor, nunca para o cliente.
        _logger.LogError(exception, "Exceção capturada pelo handler global: {Message}", exception.Message);

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            // Em 500 não expõe a mensagem original (evita vazar detalhes internos).
            Detail = status == StatusCodes.Status500InternalServerError
                ? "Ocorreu um erro inesperado. Tente novamente mais tarde."
                : exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
