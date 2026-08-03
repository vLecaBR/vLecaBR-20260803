namespace GestaoColaboradores.Application.Security;

/// <summary>
/// Configurações de emissão de tokens JWT. Preenchida a partir do appsettings/env na Fase 4.
/// </summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    /// <summary>Chave simétrica secreta usada na assinatura (mínimo recomendado: 32 bytes).</summary>
    public string Secret { get; set; } = string.Empty;

    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;

    /// <summary>Tempo de expiração do token em minutos.</summary>
    public int ExpirationMinutes { get; set; } = 60;
}
