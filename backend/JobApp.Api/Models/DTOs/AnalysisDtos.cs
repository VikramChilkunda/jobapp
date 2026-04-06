using System.ComponentModel.DataAnnotations;

namespace JobApp.Api.Models.DTOs;

public record CreateAnalysisRequest(
    [Required] string JobDescription,
    string? ResumeText,
    int? SavedResumeId,
    string? JobTitle,
    string? CompanyName
);

public record AnalysisResponse(
    int Id,
    string? JobTitle,
    string? CompanyName,
    int? FitScore,
    List<string> MatchingSkills,
    List<string> MissingSkills,
    List<SuggestionItem> Suggestions,
    string? Summary,
    DateTime CreatedAt
);

public record SuggestionItem(string Section, string Suggestion);

public record AnalysisListItem(
    int Id,
    string? JobTitle,
    string? CompanyName,
    int? FitScore,
    DateTime CreatedAt
);

public record ClaudeAnalysisResult(
    int FitScore,
    List<string> MatchingSkills,
    List<string> MissingSkills,
    List<SuggestionItem> Suggestions,
    string Summary
);
