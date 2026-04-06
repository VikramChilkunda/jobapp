using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JobApp.Api.Data;
using JobApp.Api.Models;
using JobApp.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace JobApp.Api.Services;

public class AuthService(AppDbContext db, IConfiguration config, ILogger<AuthService> logger)
{
    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        logger.LogInformation("Registration attempt for {Email}", request.Email);
        if (await db.Users.AnyAsync(u => u.Email == request.Email))
        {
            logger.LogWarning("Registration failed — email {Email} already exists", request.Email);
            return null;
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Name = request.Name
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        logger.LogInformation("User registered: {Email} (ID: {Id})", user.Email, user.Id);
        return new AuthResponse(GenerateToken(user), user.Name, user.Email);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        logger.LogInformation("Login attempt for {Email}", request.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            logger.LogWarning("Login failed for {Email}", request.Email);
            return null;
        }

        logger.LogInformation("Login successful for {Email} (ID: {Id})", user.Email, user.Id);
        return new AuthResponse(GenerateToken(user), user.Name, user.Email);
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Key"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
