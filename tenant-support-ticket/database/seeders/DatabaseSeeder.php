<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Tenant A: Abdallah's Company ──
        $tenantA = \App\Models\Tenant::create(['name' => 'Abdallah Eleyan']);

        $userA1 = \App\Models\User::create([
            'tenant_id' => $tenantA->id,
            'name' => 'Abdallah',
            'email' => 'abdallah@test.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        $userA2 = \App\Models\User::create([
            'tenant_id' => $tenantA->id,
            'name' => 'Ahmad',
            'email' => 'ahmad@test.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        // ── Tenant B: Another Company ──
        $tenantB = \App\Models\Tenant::create(['name' => 'Emre ']);

        $userB1 = \App\Models\User::create([
            'tenant_id' => $tenantB->id,
            'name' => 'emre',
            'email' => 'emre@test.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);
        
        $userB2 = \App\Models\User::create([
            'tenant_id' => $tenantB->id,
            'name' => 'Omar',
            'email' => 'omar@test.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        // ── Sample Tickets for Tenant A (only Abdallah & Ahmad can see these) ──
        \App\Models\Ticket::create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA1->id,
            'title' => 'Email not working',
            'description' => 'I cannot send or receive emails since this morning. Outlook keeps showing a connection error.',
            'status' => 'open',
            'ai_summary' => 'User is experiencing email connectivity issues with Outlook since the morning, unable to send or receive messages.',
        ]);

        \App\Models\Ticket::create([
            'tenant_id' => $tenantA->id,
            'user_id' => $userA2->id,
            'title' => 'VPN access request',
            'description' => 'I need VPN access to connect to the company network from home. Please set up my account.',
            'status' => 'open',
            'ai_summary' => 'User is requesting VPN access to be configured for remote connectivity to the company network.',
        ]);

        // ── Sample Tickets for Tenant B (only Sara & Omar can see these) ──
        \App\Models\Ticket::create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB1->id,
            'title' => 'Printer keeps jamming',
            'description' => 'The office printer on the 3rd floor keeps jamming every time I try to print more than 5 pages.',
            'status' => 'open',
            'ai_summary' => 'User reports frequent paper jams on the 3rd floor office printer when printing batches exceeding 5 pages.',
        ]);

        \App\Models\Ticket::create([
            'tenant_id' => $tenantB->id,
            'user_id' => $userB2->id,
            'title' => 'Software license expired',
            'description' => 'My Adobe Photoshop license expired yesterday and I need it for a client project due Friday.',
            'status' => 'open',
            'ai_summary' => 'User reports an expired Adobe Photoshop license that is urgently needed for a client project with a Friday deadline.',
        ]);
    }
}
