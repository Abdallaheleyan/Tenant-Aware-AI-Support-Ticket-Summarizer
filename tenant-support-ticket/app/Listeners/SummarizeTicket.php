<?php

namespace App\Listeners;

use App\Events\TicketCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SummarizeTicket implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(TicketCreated $event): void
    {
        $ticket = $event->ticket;
        $apiKey = config('services.gemini.key', env('GEMINI_API_KEY'));

        if (!$apiKey) {
            Log::error('Gemini API key is missing.');
            return;
        }

        try {
            // Using gemini-2.5-flash (current model as of March 2026)
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => "Please provide a professional, one-paragraph summary of this support ticket. Do not include any other text besides the summary. Ticket description: {$ticket->description}"]
                        ]
                    ]
                ]
            ]);


            if ($response->successful()) {
                $summary = $response->json('candidates.0.content.parts.0.text');

                if ($summary) {
                    $ticket->ai_summary = trim($summary);
                    $ticket->save();
                }
            } else {
                Log::error('Gemini API error: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('SummarizeTicket Exception: ' . $e->getMessage());
        }
    }
}
