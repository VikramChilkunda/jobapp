using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobApp.Api.Models;

public class Analysis
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [MaxLength(255)]
    public string? JobTitle { get; set; }

    [MaxLength(255)]
    public string? CompanyName { get; set; }

    [Required]
    public string JobDescription { get; set; } = string.Empty;

    [Required]
    public string ResumeText { get; set; } = string.Empty;

    public int? FitScore { get; set; }

    [Column(TypeName = "jsonb")]
    public string? MatchingSkills { get; set; }

    [Column(TypeName = "jsonb")]
    public string? MissingSkills { get; set; }

    [Column(TypeName = "jsonb")]
    public string? Suggestions { get; set; }

    public string? Summary { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
