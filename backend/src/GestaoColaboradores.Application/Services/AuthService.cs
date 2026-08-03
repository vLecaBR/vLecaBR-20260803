using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GestaoColaboradores.Application.Common.Exceptions;
using GestaoColaboradores.Application.Interfaces;
using GestaoColaboradores.Application.Security;
using GestaoColaboradores.Domain.Entities;
using GestaoColaboradores.Domain.Enums;
using GestaoColaboradores.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GestaoColaboradores.Application.Services;

/// <summary>
/// Autentica usuários via BCrypt e emite tokens JWT assinados (HMAC-SHA256).
/// </summary>
public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly JwtSettings _jwtSettings;

    public AuthService(ApplicationDbContext context, JwtSettings jwtSettings)
    {
        _context = context;
        _jwtSettings = jwtSettings;
    }

    public async Task<AuthResult> AutenticarAsync(string login, string senha, CancellationToken cancellationToken = default)
    {
        var usuario = await _context.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Login == login, cancellationToken);

        // Mensagem genérica para não revelar se o login existe.
        if (usuario is null || !BCrypt.Net.BCrypt.Verify(senha, usuario.SenhaHash))
            throw new BusinessRuleException("Login ou senha inválidos.");

        if (usuario.Status != StatusEnum.Ativo)
            throw new BusinessRuleException("Usuário inativo. Acesso negado.");

        return GerarToken(usuario);
    }

    private AuthResult GerarToken(Usuario usuario)
    {
        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);
        var expiraEm = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("codigo", usuario.Codigo),
            new Claim(ClaimTypes.Name, usuario.Login)
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: expiraEm,
            signingCredentials: credenciais);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return new AuthResult(tokenString, expiraEm);
    }
}
