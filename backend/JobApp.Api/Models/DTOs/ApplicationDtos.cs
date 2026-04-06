using System.ComponentModel.DataAnnotations;

namespace JobApp.Api.Models.DTOs;

public record CreateApplicationRequest(
    [Required] int AnalysisId,
    ApplicationStatus Status = ApplicationStatus.Wishlist,
    DateTime? AppliedDate = null,
    string? Notes = null,
    string? JobUrl = null,
    string? SalaryMin = null,
    string? SalaryMax = null,
    string? ContactName = null,
    string? ContactEmail = null
);

public record UpdateApplicationRequest(
    ApplicationStatus? Status,
    DateTime? AppliedDate,
    string? Notes,
    string? JobUrl,
    string? SalaryMin,
    string? SalaryMax,
    string? ContactName,
    string? ContactEmail
);

public record UpdateApplicationStatusRequest(
    [Required] ApplicationStatus Status
);

public record ApplicationResponse(
    int Id,
    int AnalysisId,
    string? JobTitle,
    string? CompanyName,
    int? FitScore,
    ApplicationStatus Status,
    DateTime? AppliedDate,
    string? Notes,
    string? JobUrl,
    string? SalaryMin,
    string? SalaryMax,
    string? ContactName,
    string? ContactEmail,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ApplicationListItem(
    int Id,
    int AnalysisId,
    string? JobTitle,
    string? CompanyName,
    int? FitScore,
    ApplicationStatus Status,
    DateTime? AppliedDate,
    DateTime CreatedAt
);
