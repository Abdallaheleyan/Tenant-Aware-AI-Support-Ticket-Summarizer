'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

interface Ticket {
    id: number;
    title: string;
    description: string;
    status: string;
    ai_summary: string | null;
    created_at: string;
}

export default function DashboardPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [showForm, setShowForm] = useState(false);

    const router = useRouter();

    const fetchTickets = useCallback(async (isBackground = false) => {
        try {
            const response = await axios.get('/api/tickets');
            setTickets(response.data);
            setError('');
        } catch {
            if (!isBackground) {
                setError('Failed to load tickets. Please try logging in again.');
            }
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Auto-polling every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchTickets(true), 3000);
        return () => clearInterval(interval);
    }, [fetchTickets]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await axios.post('/api/tickets', {
                title: newTitle,
                description: newDescription,
            });
            setNewTitle('');
            setNewDescription('');
            setShowForm(false);
            await fetchTickets();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create ticket.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/logout');
        } catch {
            console.warn('Session expired, redirecting to login.');
        } finally {
            router.push('/login');
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'open') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10';
        if (status === 'resolved') return 'bg-green-50 text-green-700 ring-1 ring-green-600/20';
        return 'bg-gray-50 text-gray-600 ring-1 ring-gray-500/10';
    };

    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-gray-900">Support Tickets</h1>
                            <p className="text-xs text-gray-500">AI-powered summarization</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                {showForm ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                )}
                            </svg>
                            {showForm ? 'Cancel' : 'New Ticket'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {/* Error Banner */}
                {error && (
                    <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Dashboard Stats */}
                {!loading && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-gray-900">{totalTickets}</p>
                                    <p className="text-xs text-gray-500">Total Tickets</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-50">
                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-red-600">{openTickets}</p>
                                    <p className="text-xs text-gray-500">Open Issues</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-50">
                                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-green-600">{resolvedTickets}</p>
                                    <p className="text-xs text-gray-500">Resolved</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Ticket Form */}
                {showForm && (
                    <div className="mb-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Create a new ticket</h2>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    required
                                    className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Brief issue summary"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1.5">Description</label>
                                <textarea
                                    id="description"
                                    required
                                    rows={3}
                                    className="block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Describe the problem in detail..."
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {isSubmitting ? 'Generating AI summary...' : 'Submit Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Page Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">All Tickets</h2>
                        <p className="text-sm text-gray-500">Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} for your organization</p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="text-center py-16 px-6">
                            <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
                            </svg>
                            <h3 className="mt-3 text-sm font-medium text-gray-900">No tickets yet</h3>
                            <p className="mt-1 text-sm text-gray-500">Create your first support ticket to get started.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer">
                                {/* Ticket header row */}
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {ticket.title}
                                        </h3>
                                    </div>
                                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-500 leading-relaxed mb-4 pl-9">
                                    {ticket.description}
                                </p>

                                {/* AI Summary */}
                                <div className="ml-9 rounded-md bg-gray-50 border border-gray-100 px-4 py-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                                        </svg>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Summary</span>
                                    </div>
                                    {ticket.ai_summary ? (
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {ticket.ai_summary}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">
                                            Summary not available for this ticket.
                                        </p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="mt-3 pl-9 text-xs text-gray-400">
                                    Created {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
