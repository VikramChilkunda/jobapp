using System.Text.Json;
using JobApp.Api.Data;
using JobApp.Api.Models;
using JobApp.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace JobApp.Api.Services;

public class AnalysisService(AppDbContext db, ClaudeService claude, ILogger<AnalysisService> logger)
{
    public async Task<AnalysisResponse> CreateAsync(int userId, CreateAnalysisRequest request)
    {
        logger.LogInformation("Creating analysis for user {UserId} — job: {JobTitle}, company: {Company}",
            userId, request.JobTitle ?? "(none)", request.CompanyName ?? "(none)");

        // Resolve resume text from saved resume or direct input
        var resumeText = request.ResumeText;
        if (request.SavedResumeId.HasValue)
        {
            var savedResume = await db.SavedResumes
                .FirstOrDefaultAsync(r => r.Id == request.SavedResumeId.Value && r.UserId == userId);
            if (savedResume is null)
                throw new ArgumentException("Saved resume not found");
            resumeText = savedResume.Content;
            logger.LogInformation("Using saved resume: {Label}", savedResume.Label);
        }

        if (string.IsNullOrWhiteSpace(resumeText))
            throw new ArgumentException("Resume text is required");

        logger.LogInformation("Calling Gemini AI for analysis...");
        var result = await claude.AnalyzeAsync(request.JobDescription, resumeText);

        logger.LogInformation("AI analysis complete — saving to database...");
        var analysis = new Analysis
        {
            UserId = userId,
            JobTitle = request.JobTitle,
            CompanyName = request.CompanyName,
            JobDescription = request.JobDescription,
            ResumeText = resumeText,
            FitScore = result.FitScore,
            MatchingSkills = JsonSerializer.Serialize(result.MatchingSkills),
            MissingSkills = JsonSerializer.Serialize(result.MissingSkills),
            Suggestions = JsonSerializer.Serialize(result.Suggestions),
            Summary = result.Summary
        };

        db.Analyses.Add(analysis);
        await db.SaveChangesAsync();
        logger.LogInformation("Analysis saved with ID {Id}, fit score: {Score}", analysis.Id, analysis.FitScore);

        return ToResponse(analysis, result.MatchingSkills, result.MissingSkills, result.Suggestions);
    }

    public async Task<List<AnalysisListItem>> GetAllAsync(int userId)
    {
        logger.LogInformation("Fetching analyses for user {UserId}", userId);
        return await db.Analyses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AnalysisListItem(
                a.Id, a.JobTitle, a.CompanyName, a.FitScore, a.CreatedAt))
            .ToListAsync();
    }

    public async Task<Analysis?> GetRawAsync(int userId, int id)
    {
        return await db.Analyses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
    }

    public async Task<AnalysisResponse?> GetByIdAsync(int userId, int id)
    {
        var analysis = await db.Analyses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (analysis is null) return null;

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var matchingSkills = JsonSerializer.Deserialize<List<string>>(analysis.MatchingSkills ?? "[]", options) ?? [];
        var missingSkills = JsonSerializer.Deserialize<List<string>>(analysis.MissingSkills ?? "[]", options) ?? [];
        var suggestions = JsonSerializer.Deserialize<List<SuggestionItem>>(analysis.Suggestions ?? "[]", options) ?? [];

        return ToResponse(analysis, matchingSkills, missingSkills, suggestions);
    }

    private static AnalysisResponse ToResponse(
        Analysis a, List<string> matching, List<string> missing, List<SuggestionItem> suggestions)
    {
        return new AnalysisResponse(
            a.Id, a.JobTitle, a.CompanyName, a.FitScore,
            matching, missing, suggestions, a.Summary, a.CreatedAt);
    }
}
