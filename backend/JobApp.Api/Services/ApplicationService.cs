using JobApp.Api.Data;
using JobApp.Api.Models;
using JobApp.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace JobApp.Api.Services;

public class ApplicationService(AppDbContext db, ILogger<ApplicationService> logger)
{
    public async Task<List<ApplicationListItem>> GetAllAsync(int userId)
    {
        logger.LogInformation("Fetching applications for user {UserId}", userId);
        return await db.Applications
            .Where(a => a.UserId == userId)
            .Include(a => a.Analysis)
            .OrderByDescending(a => a.UpdatedAt)
            .Select(a => new ApplicationListItem(
                a.Id, a.AnalysisId,
                a.Analysis.JobTitle, a.Analysis.CompanyName, a.Analysis.FitScore,
                a.Status, a.AppliedDate, a.CreatedAt))
            .ToListAsync();
    }

    public async Task<ApplicationResponse?> GetByIdAsync(int userId, int id)
    {
        var app = await db.Applications
            .Include(a => a.Analysis)
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        return app is null ? null : ToResponse(app);
    }

    public async Task<ApplicationResponse?> CreateAsync(int userId, CreateApplicationRequest request)
    {
        var analysis = await db.Analyses
            .FirstOrDefaultAsync(a => a.Id == request.AnalysisId && a.UserId == userId);

        if (analysis is null)
        {
            logger.LogWarning("Analysis {AnalysisId} not found for user {UserId}", request.AnalysisId, userId);
            return null;
        }

        if (await db.Applications.AnyAsync(a => a.AnalysisId == request.AnalysisId))
        {
            logger.LogWarning("Application already exists for analysis {AnalysisId}", request.AnalysisId);
            return null;
        }

        var app = new Application
        {
            UserId = userId,
            AnalysisId = request.AnalysisId,
            Status = request.Status,
            AppliedDate = request.AppliedDate,
            Notes = request.Notes,
            JobUrl = request.JobUrl,
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            ContactName = request.ContactName,
            ContactEmail = request.ContactEmail
        };

        db.Applications.Add(app);
        await db.SaveChangesAsync();

        // Reload with Analysis for response
        await db.Entry(app).Reference(a => a.Analysis).LoadAsync();
        logger.LogInformation("Application {Id} created for analysis {AnalysisId}", app.Id, app.AnalysisId);
        return ToResponse(app);
    }

    public async Task<ApplicationResponse?> UpdateAsync(int userId, int id, UpdateApplicationRequest request)
    {
        var app = await db.Applications
            .Include(a => a.Analysis)
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (app is null) return null;

        if (request.Status.HasValue) app.Status = request.Status.Value;
        if (request.AppliedDate.HasValue) app.AppliedDate = request.AppliedDate;
        if (request.Notes is not null) app.Notes = request.Notes;
        if (request.JobUrl is not null) app.JobUrl = request.JobUrl;
        if (request.SalaryMin is not null) app.SalaryMin = request.SalaryMin;
        if (request.SalaryMax is not null) app.SalaryMax = request.SalaryMax;
        if (request.ContactName is not null) app.ContactName = request.ContactName;
        if (request.ContactEmail is not null) app.ContactEmail = request.ContactEmail;

        app.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        logger.LogInformation("Application {Id} updated", id);
        return ToResponse(app);
    }

    public async Task<ApplicationResponse?> UpdateStatusAsync(int userId, int id, UpdateApplicationStatusRequest request)
    {
        var app = await db.Applications
            .Include(a => a.Analysis)
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (app is null) return null;

        app.Status = request.Status;
        if (request.Status == ApplicationStatus.Applied && app.AppliedDate is null)
            app.AppliedDate = DateTime.UtcNow;

        app.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        logger.LogInformation("Application {Id} status changed to {Status}", id, request.Status);
        return ToResponse(app);
    }

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var app = await db.Applications
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (app is null) return false;

        db.Applications.Remove(app);
        await db.SaveChangesAsync();

        logger.LogInformation("Application {Id} deleted", id);
        return true;
    }

    private static ApplicationResponse ToResponse(Application a) => new(
        a.Id, a.AnalysisId,
        a.Analysis.JobTitle, a.Analysis.CompanyName, a.Analysis.FitScore,
        a.Status, a.AppliedDate, a.Notes, a.JobUrl,
        a.SalaryMin, a.SalaryMax, a.ContactName, a.ContactEmail,
        a.CreatedAt, a.UpdatedAt);
}
