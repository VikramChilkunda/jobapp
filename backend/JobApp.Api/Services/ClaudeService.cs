using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using JobApp.Api.Models.DTOs;

namespace JobApp.Api.Services;

public class ClaudeService(IConfiguration config, IHttpClientFactory httpClientFactory, ILogger<ClaudeService> logger)
{
    public async Task<ClaudeAnalysisResult> AnalyzeAsync(string jobDescription, string resumeText)
    {
        logger.LogInformation("Starting analysis — JD length: {JdLen} chars, Resume length: {ResumeLen} chars",
            jobDescription.Length, resumeText.Length);

        var apiKey = config["Gemini:ApiKey"]
            ?? throw new InvalidOperationException("Gemini:ApiKey not configured");

        var client = httpClientFactory.CreateClient();
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

        var prompt = BuildPrompt(jobDescription, resumeText);
        logger.LogInformation("Prompt built — total length: {Len} chars", prompt.Length);

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                temperature = 0.3
            }
        };

        var json = JsonSerializer.Serialize(requestBody);

        // Retry with backoff on rate limit (429)
        HttpResponseMessage response = null!;
        string responseText = "";
        for (var attempt = 0; attempt < 3; attempt++)
        {
            if (attempt > 0)
            {
                var delay = attempt * 5;
                logger.LogWarning("Rate limited (429) — retrying in {Delay}s (attempt {Attempt}/3)", delay, attempt + 1);
                await Task.Delay(TimeSpan.FromSeconds(delay));
            }

            logger.LogInformation("Sending request to Gemini API (attempt {Attempt}/3)...", attempt + 1);
            response = await client.PostAsync(url,
                new StringContent(json, Encoding.UTF8, "application/json"));
            responseText = await response.Content.ReadAsStringAsync();

            logger.LogInformation("Gemini responded with status {Status}", (int)response.StatusCode);

            if ((int)response.StatusCode != 429)
                break;
        }

        if ((int)response.StatusCode == 429)
        {
            logger.LogError("Rate limited after 3 attempts. Response: {Body}", responseText);
            throw new InvalidOperationException("Rate limited by Gemini API. Please wait a minute and try again.");
        }

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError("Gemini API error {Status}: {Body}", (int)response.StatusCode, responseText);
            throw new InvalidOperationException($"Gemini API error: {responseText}");
        }

        logger.LogInformation("Parsing Gemini response ({Len} chars)...", responseText.Length);

        var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseText);
        var resultText = geminiResponse?.Candidates?.FirstOrDefault()
            ?.Content?.Parts?.FirstOrDefault()?.Text;

        if (resultText is null)
        {
            logger.LogError("Empty Gemini response. Full body: {Body}", responseText);
            throw new InvalidOperationException("Empty Gemini response");
        }

        logger.LogInformation("Extracted result JSON ({Len} chars), deserializing...", resultText.Length);
        logger.LogDebug("Raw result JSON: {Json}", resultText);

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var result = JsonSerializer.Deserialize<ClaudeAnalysisResult>(resultText, options);

        if (result is null)
        {
            logger.LogError("Failed to deserialize result. Raw JSON: {Json}", resultText);
            throw new InvalidOperationException("Failed to parse Gemini response");
        }

        logger.LogInformation("Analysis complete — fit score: {Score}", result.FitScore);
        return result;
    }

    private static string BuildPrompt(string jobDescription, string resumeText)
    {
        return @"You are an expert career advisor and resume analyst. Analyze the fit between this job description and resume.

Return valid JSON with this exact structure:
{
    ""fitScore"": <number 0-100>,
    ""matchingSkills"": [""skill1"", ""skill2""],
    ""missingSkills"": [""skill1"", ""skill2""],
    ""suggestions"": [
        {""section"": ""Experience"", ""suggestion"": ""specific actionable suggestion""},
        {""section"": ""Skills"", ""suggestion"": ""specific actionable suggestion""}
    ],
    ""summary"": ""2-3 sentence overall assessment""
}

Be specific and actionable in suggestions. Reference actual content from both the JD and resume.

=== JOB DESCRIPTION ===
" + jobDescription + @"

=== RESUME ===
" + resumeText;
    }
}

// Gemini API response types
file class GeminiResponse
{
    [JsonPropertyName("candidates")]
    public List<GeminiCandidate>? Candidates { get; set; }
}

file class GeminiCandidate
{
    [JsonPropertyName("content")]
    public GeminiContent? Content { get; set; }
}

file class GeminiContent
{
    [JsonPropertyName("parts")]
    public List<GeminiPart>? Parts { get; set; }
}

file class GeminiPart
{
    [JsonPropertyName("text")]
    public string? Text { get; set; }
}
