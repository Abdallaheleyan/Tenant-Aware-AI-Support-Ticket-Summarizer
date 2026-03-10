# Tenant-Aware AI Support Ticket Summarizer - Architecture Documentation

## Overview
This document outlines the high-level architecture, design decisions, and core components of the Tenant-Aware AI Support Ticket Summarizer application. The system is designed to provide secure, isolated environments for multiple companies (tenants) while utilizing the Google Gemini API to automatically summarize incoming customer support tickets.

## Tech Stack
*   **Backend:** Laravel 11 (PHP 8.3)
*   **Frontend:** Next.js 14 (React) with Tailwind CSS
*   **Database:** PostgreSQL (via Laravel Sail/Docker)
*   **AI Integration:** Google Gemini API

## Multi-Tenancy Architecture
The application employs a **Single Database, Row-Level Isolation** multi-tenancy model. 

### Implementation Details:
1.  **Schema Design:** 
    *   Both the `users` and `tickets` tables contain a `tenant_id` foreign key that references the `tenants` table.
2.  **Global Scopes (The Core Security Layer):**
    *   To prevent accidental data leakage between tenants, we utilize Laravel's **Global Scopes**.
    *   The `TenantScope` is automatically applied to all relevant Eloquent models (like `Ticket` and `User`).
    *   Whenever an Eloquent query is executed, the scope seamlessly intercepts it and appends a `WHERE tenant_id = ?` clause based on the currently authenticated user's session.
    *   *Why this approach?* By enforcing isolation at the Model layer rather than the Controller layer, we ensure that a developer can never accidentally query another tenant's data, even if they forget to add a `where()` clause in a new feature.

## Application Architecture

### The Service Pattern
To keep our API Controllers thin and easily testable, we implemented the **Service Pattern**.

*   **Controllers (`TicketController`):** Only handle HTTP routing, request validation, and returning JSON responses. They do not contain business logic.
*   **Services (`TicketService`):** Encapsulate the core business logic. For example, the `TicketService` handles the orchestration of verifying data, communicating with the AI API, and saving the final ticket to the database.

### AI Summarization Flow (Fail-Safe Strategy)
When a user submits a new ticket from the Next.js frontend, the backend processes it synchronously to provide immediate feedback:

1.  **Request Reception:** The `TicketController` receives and validates the title and description.
2.  **AI Invocation:** The `TicketService` extracts the description and sends it to the Google Gemini API (`generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`) via Laravel's HTTP Client.
3.  **Graceful Degradation:** The HTTP call is wrapped in a `try/catch` block with a strict timeout. 
    *   *Success:* The AI summary is extracted from the JSON response and saved with the ticket.
    *   *Failure (Timeout/500 Error):* If the Gemini API is down, the application catches the exception and falls back to a default soft-error message: `"AI could not summarize this ticket. Please review manually."` This ensures the ticket is still reliably saved for the user even if the external dependency fails.

## Automated Testing Strategy
Quality assurance and security verification are handled through a suite of automated Pest/PHPUnit tests.

1.  **HTTP Mocking:** External API calls to Google Gemini are mocked using Laravel's `Http::fake()`. This ensures tests run instantaneously, do not incur API costs, and execute predictably without relying on external network availability.
2.  **Security Assertions:** Tests explicitly verify the multi-tenant Global Scopes by authenticating as "User A", querying the API, and asserting that "Ticket B" (belonging to another tenant) is completely inaccessible.
3.  **Resilience Testing:** Tests verify the graceful degradation logic by forcefully simulating `500 Server Errors` from the mock AI service to ensure the fallback string is applied correctly.
