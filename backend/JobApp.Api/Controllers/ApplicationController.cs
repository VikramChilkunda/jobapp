using System.Security.Claims;
using JobApp.Api.Models.DTOs;
using JobApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ApplicationController(ApplicationService applicationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var results = await applicationService.GetAllAsync(GetUserId());
        return Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await applicationService.GetByIdAsync(GetUserId(), id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateApplicationRequest request)
    {
        var result = await applicationService.CreateAsync(GetUserId(), request);
        if (result is null) return BadRequest(new { message = "Invalid analysis or application already exists" });
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateApplicationRequest request)
    {
        var result = await applicationService.UpdateAsync(GetUserId(), id, request);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateApplicationStatusRequest request)
    {
        var result = await applicationService.UpdateStatusAsync(GetUserId(), id, request);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await applicationService.DeleteAsync(GetUserId(), id);
        if (!deleted) return NotFound();
        return NoContent();
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
