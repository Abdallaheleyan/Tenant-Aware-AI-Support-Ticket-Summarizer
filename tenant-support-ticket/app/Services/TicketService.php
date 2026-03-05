<?php

namespace App\Services;

use App\Models\Ticket;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TicketService
{
    /**
     * Create a new support ticket for the authenticated user's tenant.
     * The AI summary is generated synchronously so the user sees it instantly.
     *
     * @param array $data
     * @return Ticket
     */
    public function createTicket(array $data): Ticket
    {
        // 1. Generate AI summary synchronously first
        $aiSummary = $this->generateSummary($data['description']);

        // 2. Create ticket with the summary already attached
        $ticket = Ticket::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'tenant_id' => Auth::user()->tenant_id,
            'user_id' => Auth::id(),
            'status' => 'open',
            'ai_summary' => $aiSummary,
        ]);

        return $ticket;
    }

    /**
     * Call the Gemini API synchronously to generate a summary.
     * Returns a fallback message if the API fails for any reason.
     */
    private function generateSummary(string $description): string
    {
        $apiKey = config('services.gemini.key', env('GEMINI_API_KEY'));

        if (!$apiKey) {
            Log::error('Gemini API key is missing.');
            return 'AI summary unavailable — API key not configured.';
        }

        try {
            $response = Http::timeout(15)->withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => "Please summarize this support ticket professionally. Keep it concise. If the ticket description is already very short (under 2 sentences), do not artificially lengthen it; just rephrase it cleanly. Do not include any other text besides the summary. Ticket description: {$description}"]
                        ]
                    ]
                ]
            ]);

            if ($response->successful()) {
                $summary = $response->json('candidates.0.content.parts.0.text');
                if ($summary) {
                    return trim($summary);
                }
            }

            Log::error('Gemini API error: ' . $response->body());
            return 'AI could not summarize this ticket. Please review manually.';
        } catch (\Exception $e) {
            Log::error('SummarizeTicket Exception: ' . $e->getMessage());
            return 'AI summary failed due to a network error. Please try again later.';
        }
    }
}
