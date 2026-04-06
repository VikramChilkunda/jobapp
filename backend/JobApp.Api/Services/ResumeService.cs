using JobApp.Api.Data;
using JobApp.Api.Models;
using JobApp.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace JobApp.Api.Services;

public class ResumeService(AppDbContext db, ILogger<ResumeService> logger)
{
    public async Task<List<ResumeResponse>> GetAllAsync(int userId)
    {
        return await db.SavedResumes
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.IsDefault)
            .ThenByDescending(r => r.UpdatedAt)
            .Select(r => new ResumeResponse(r.Id, r.Label, r.IsDefault, r.CreatedAt, r.UpdatedAt))
            .ToListAsync();
    }

    public async Task<ResumeDetailResponse?> GetByIdAsync(int userId, int id)
    {
        var resume = await db.SavedResumes
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        return resume is null ? null : ToDetail(resume);
    }

    public async Task<ResumeDetailResponse> CreateAsync(int userId, CreateResumeRequest request)
    {
        if (request.IsDefault)
            await ClearDefaultsAsync(userId);

        var resume = new SavedResume
        {
            UserId = userId,
            Label = request.Label,
            Content = request.Content,
            IsDefault = request.IsDefault
        };

        db.SavedResumes.Add(resume);
        await db.SaveChangesAsync();

        logger.LogInformation("Resume {Id} created: {Label}", resume.Id, resume.Label);
        return ToDetail(resume);
    }

    public async Task<ResumeDetailResponse?> UpdateAsync(int userId, int id, UpdateResumeRequest request)
    {
        var resume = await db.SavedResumes
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resume is null) return null;

        if (request.Label is not null) resume.Label = request.Label;
        if (request.Content is not null) resume.Content = request.Content;
        if (request.IsDefault.HasValue)
        {
            if (request.IsDefault.Value)
                await ClearDefaultsAsync(userId);
            resume.IsDefault = request.IsDefault.Value;
        }

        resume.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        logger.LogInformation("Resume {Id} updated", id);
        return ToDetail(resume);
    }

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var resume = await db.SavedResumes
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (resume is null) return false;

        db.SavedResumes.Remove(resume);
        await db.SaveChangesAsync();

        logger.LogInformation("Resume {Id} deleted", id);
        return true;
    }

    private async Task ClearDefaultsAsync(int userId)
    {
        await db.SavedResumes
            .Where(r => r.UserId == userId && r.IsDefault)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.IsDefault, false));
    }

    private static ResumeDetailResponse ToDetail(SavedResume r) =>
        new(r.Id, r.Label, r.Content, r.IsDefault, r.CreatedAt, r.UpdatedAt);
}
