<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Inertia\Inertia;

class HomeController extends Controller
{
    /** Menampilkan halaman utama beserta event publik terbaru. */
    public function index()
    {
        // Ambil event yang bukan draft, urutkan dari yang paling baru
        $events = Event::query()
            ->where('status', '!=', 'draft')
            ->latest()
            ->take(6)
            ->get();

        return Inertia::render('welcome', [
            'events' => $events,
        ]);
    }
}