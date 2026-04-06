using JobApp.Api.Models.DTOs;
using JobApp.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JobApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await authService.RegisterAsync(request);
        if (result is null)
            return Conflict(new { message = "Email already registered" });

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        if (result is null)
            return Unauthorized(new { message = "Invalid email or password" });

        return Ok(result);
    }
}
