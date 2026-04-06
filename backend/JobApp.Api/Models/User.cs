using System.ComponentModel.DataAnnotations;

namespace JobApp.Api.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Analysis> Analyses { get; set; } = [];
    public List<Application> Applications { get; set; } = [];
    public List<SavedResume> SavedResumes { get; set; } = [];
}
