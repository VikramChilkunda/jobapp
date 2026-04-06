using System.ComponentModel.DataAnnotations;

namespace JobApp.Api.Models.DTOs;

public record CreateResumeRequest(
    [Required, MaxLength(100)] string Label,
    [Required] string Content,
    bool IsDefault = false
);

public record UpdateResumeRequest(
    string? Label,
    string? Content,
    bool? IsDefault
);

public record ResumeResponse(
    int Id,
    string Label,
    bool IsDefault,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ResumeDetailResponse(
    int Id,
    string Label,
    string Content,
    bool IsDefault,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
