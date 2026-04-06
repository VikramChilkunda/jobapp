using System.ComponentModel.DataAnnotations;

namespace JobApp.Api.Models;

public class Application
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int AnalysisId { get; set; }
    public Analysis Analysis { get; set; } = null!;

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Wishlist;

    public DateTime? AppliedDate { get; set; }

    public string? Notes { get; set; }

    [MaxLength(2048)]
    public string? JobUrl { get; set; }

    [MaxLength(100)]
    public string? SalaryMin { get; set; }

    [MaxLength(100)]
    public string? SalaryMax { get; set; }

    [MaxLength(255)]
    public string? ContactName { get; set; }

    [MaxLength(255)]
    public string? ContactEmail { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
