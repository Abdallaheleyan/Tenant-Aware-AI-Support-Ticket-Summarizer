<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;

class TicketController extends Controller
{
    protected TicketService $ticketService;

    public function __construct(TicketService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    /**
     * Display a listing of the tickets for the current tenant.
     */
    public function index(): JsonResponse
    {
        // The Global Scope automatically filters this! We don't need to specify tenant_id.
        $tickets = Ticket::with('user')->latest()->get();
        return response()->json($tickets);
    }

    /**
     * Store a newly created ticket in the database.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        // Pass the validated data to our "Chef" (the TicketService)
        $ticket = $this->ticketService->createTicket($validated);

        return response()->json($ticket, 201);
    }

    /**
     * Toggle a ticket between open and resolved.
     */
    public function toggleStatus(Ticket $ticket): JsonResponse
    {
        $newStatus = $ticket->status === 'open' ? 'resolved' : 'open';
        $ticket->update(['status' => $newStatus]);
        return response()->json($ticket);
    }
}
