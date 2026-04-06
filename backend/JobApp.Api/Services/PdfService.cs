using System.Text.Json;
using JobApp.Api.Models;
using JobApp.Api.Models.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace JobApp.Api.Services;

public class PdfService
{
    public byte[] GenerateAnalysisReport(Analysis analysis)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var matchingSkills = JsonSerializer.Deserialize<List<string>>(analysis.MatchingSkills ?? "[]", options) ?? [];
        var missingSkills = JsonSerializer.Deserialize<List<string>>(analysis.MissingSkills ?? "[]", options) ?? [];
        var suggestions = JsonSerializer.Deserialize<List<SuggestionItem>>(analysis.Suggestions ?? "[]", options) ?? [];

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.Letter);
                page.Margin(40);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Column(col =>
                {
                    col.Item().Text("JobFit AI — Analysis Report")
                        .FontSize(20).Bold().FontColor(Colors.Grey.Darken3);
                    col.Item().PaddingTop(4).Text(
                        $"{analysis.JobTitle ?? "Untitled"} at {analysis.CompanyName ?? "Unknown"} — {analysis.CreatedAt:MMM dd, yyyy}")
                        .FontSize(10).FontColor(Colors.Grey.Medium);
                    col.Item().PaddingTop(8).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                });

                page.Content().PaddingTop(16).Column(col =>
                {
                    // Fit Score
                    col.Item().PaddingBottom(12).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("Fit Score").Bold().FontSize(12);
                            c.Item().PaddingTop(4).Text($"{analysis.FitScore}/100")
                                .FontSize(28).Bold()
                                .FontColor(analysis.FitScore >= 75 ? Colors.Green.Darken1
                                    : analysis.FitScore >= 50 ? Colors.Orange.Darken1
                                    : Colors.Red.Darken1);
                        });
                    });

                    // Summary
                    if (!string.IsNullOrEmpty(analysis.Summary))
                    {
                        col.Item().PaddingBottom(16).Column(c =>
                        {
                            c.Item().Text("Summary").Bold().FontSize(12);
                            c.Item().PaddingTop(4).Text(analysis.Summary).LineHeight(1.4f);
                        });
                    }

                    // Skills
                    col.Item().PaddingBottom(16).Row(row =>
                    {
                        row.RelativeItem().PaddingRight(8).Column(c =>
                        {
                            c.Item().Text("Matching Skills").Bold().FontSize(12)
                                .FontColor(Colors.Green.Darken1);
                            c.Item().PaddingTop(4);
                            foreach (var skill in matchingSkills)
                                c.Item().Text($"  {skill}").FontSize(10).LineHeight(1.5f);
                            if (matchingSkills.Count == 0)
                                c.Item().Text("None identified").Italic().FontColor(Colors.Grey.Medium);
                        });

                        row.RelativeItem().PaddingLeft(8).Column(c =>
                        {
                            c.Item().Text("Skill Gaps").Bold().FontSize(12)
                                .FontColor(Colors.Red.Darken1);
                            c.Item().PaddingTop(4);
                            foreach (var skill in missingSkills)
                                c.Item().Text($"  {skill}").FontSize(10).LineHeight(1.5f);
                            if (missingSkills.Count == 0)
                                c.Item().Text("None identified").Italic().FontColor(Colors.Grey.Medium);
                        });
                    });

                    // Suggestions
                    if (suggestions.Count > 0)
                    {
                        col.Item().Column(c =>
                        {
                            c.Item().Text("Resume Suggestions").Bold().FontSize(12);
                            c.Item().PaddingTop(4);
                            for (var i = 0; i < suggestions.Count; i++)
                            {
                                var s = suggestions[i];
                                c.Item().PaddingBottom(8).Row(r =>
                                {
                                    r.AutoItem().Text($"{i + 1}. ").Bold();
                                    r.RelativeItem().Column(sc =>
                                    {
                                        sc.Item().Text(s.Section).Bold().FontSize(9)
                                            .FontColor(Colors.Grey.Darken1);
                                        sc.Item().Text(s.Suggestion).LineHeight(1.4f);
                                    });
                                });
                            }
                        });
                    }
                });

                page.Footer().AlignCenter()
                    .Text(t =>
                    {
                        t.Span("Generated by JobFit AI — ").FontSize(8).FontColor(Colors.Grey.Medium);
                        t.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Medium);
                    });
            });
        });

        return document.GeneratePdf();
    }
}
