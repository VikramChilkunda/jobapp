using JobApp.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobApp.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Analysis> Analyses => Set<Analysis>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<SavedResume> SavedResumes => Set<SavedResume>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Analysis>(entity =>
        {
            entity.HasOne(a => a.User)
                .WithMany(u => u.Analyses)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasOne(a => a.User)
                .WithMany(u => u.Applications)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.Analysis)
                .WithMany()
                .HasForeignKey(a => a.AnalysisId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(a => new { a.UserId, a.Status });
        });

        modelBuilder.Entity<SavedResume>(entity =>
        {
            entity.HasOne(r => r.User)
                .WithMany(u => u.SavedResumes)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
