# AI Support Ticket Summarizer

A multi-tenant SaaS that automatically summarizes support tickets using Google Gemini. 
Built with Laravel 11 (Backend) and Next.js (Frontend).

## How to Run Locally

You only need Docker and Node.js installed. The project uses Laravel Sail, so no local PHP or Postgres setup is required. The Gemini API key is already included for your convenience.

### 1. Start the Backend (Terminal 1)
Open a terminal (if on Windows, *we highly recommend using WSL* or Git Bash). Go into the tenant-support-ticket folder, and run:

```bash
cd tenant-support-ticket

# Copy environment file (API key is already set inside it)
cp .env.example .env

# --- FOR MAC / LINUX / WSL ---
# Install PHP dependencies
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd):/var/www/html" -w /var/www/html laravelsail/php83-composer:latest composer install --ignore-platform-reqs
# Boot up the database and backend API
./vendor/bin/sail up -d
# Generate app key and seed the database with test data
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed

# --- FOR WINDOWS POWERSHELL (Without WSL) ---
docker run --rm -v "${PWD}:/var/www/html" -w /var/www/html laravelsail/php83-composer:latest composer install --ignore-platform-reqs
$env:WWWUSER="1000"; $env:WWWGROUP="1000"; docker compose up -d
docker compose exec -u sail laravel.test php artisan key:generate
docker compose exec -u sail laravel.test php artisan migrate --seed
```

### 2. Start the Frontend (Terminal 2)
Open a *new* terminal, go into the frontend folder, and run:

```bash
cd frontend
npm install
npm run dev
```

## Testing the App

Go to *http://localhost:3000*. The database is pre-seeded with two different companies to demonstrate strict data isolation. 

You can login with either account:

*Company Alpha:* abdallah@test.com / password
*Company Beta:* emre@test.com / password

Create a new ticket from the dashboard to see the AI generate a summary instantly.
