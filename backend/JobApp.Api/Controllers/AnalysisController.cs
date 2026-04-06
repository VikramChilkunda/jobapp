using System.Security.Claims;
using JobApp.Api.Models.DTOs;
using JobApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalysisController(AnalysisService analysisService, PdfService pdfService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateAnalysisRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await analysisService.CreateAsync(userId, request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(502, new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var results = await analysisService.GetAllAsync(userId);
        return Ok(results);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var result = await analysisService.GetByIdAsync(userId, id);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> DownloadPdf(int id)
    {
        var userId = GetUserId();
        var analysis = await analysisService.GetRawAsync(userId, id);
        if (analysis is null) return NotFound();

        var pdf = pdfService.GenerateAnalysisReport(analysis);
        var fileName = $"JobFit-{analysis.JobTitle ?? "Analysis"}-{analysis.CreatedAt:yyyy-MM-dd}.pdf";
        return File(pdf, "application/pdf", fileName);
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
