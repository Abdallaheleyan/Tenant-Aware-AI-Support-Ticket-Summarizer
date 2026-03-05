<?php

namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TicketFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_a_ticket_and_successfully_mocks_the_ai_summary_api(): void
    {
        // 1. Arrange: Create a user and a tenant
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        // 2. Arrange: Intercept the real Google Gemini API and mock its response
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => 'This is a mocked AI summary.']
                            ]
                        ]
                    ]
                ]
            ], 200)
        ]);

        // 3. Act: The user hits the endpoint to create a ticket
        $response = $this->actingAs($user)->postJson('/api/tickets', [
            'title' => 'My Test Ticket',
            'description' => 'I cannot login to my account.'
        ]);

        // 4. Assert: The endpoint returns 201 Created and the exact mocked summary
        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'title' => 'My Test Ticket',
                     'ai_summary' => 'This is a mocked AI summary.'
                 ]);
        
        // Assert it actually saved to the database correctly
        $this->assertDatabaseHas('tickets', [
            'title' => 'My Test Ticket',
            'tenant_id' => $tenant->id,
            'ai_summary' => 'This is a mocked AI summary.'
        ]);
    }

    public function test_enforces_strict_multi_tenancy_so_users_cannot_see_other_tenant_tickets(): void
    {
        // 1. Arrange: Create Tenant A and User A
        $tenantA = Tenant::factory()->create();
        $userA = User::factory()->create(['tenant_id' => $tenantA->id]);

        // 2. Arrange: Create Tenant B and a ticket belonging to Tenant B
        $tenantB = Tenant::factory()->create();
        $userB = User::factory()->create(['tenant_id' => $tenantB->id]);
        $ticketB = Ticket::factory()->create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB->id
        ]);

        // 3. Act & Assert: User A tries to get all tickets. They should NOT see Ticket B.
        $response = $this->actingAs($userA)->getJson('/api/tickets');
        
        $response->assertStatus(200);
        $this->assertEmpty($response->json());
    }

    public function test_gracefully_handles_gemini_api_timeouts_without_crashing_the_app(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);

        // Mock a timeout or 500 server error from Google
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response('Server Error', 500)
        ]);

        $response = $this->actingAs($user)->postJson('/api/tickets', [
            'title' => 'Broken API Ticket',
            'description' => 'This should fail gracefully.'
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment([
                     'ai_summary' => 'AI could not summarize this ticket. Please review manually.'
                 ]);
    }
}
