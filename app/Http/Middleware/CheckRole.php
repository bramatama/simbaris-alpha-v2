<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(
        Request $request,
        Closure $next,
        ...$roles
    ): Response {
        // Pastikan pengguna sudah login
        if (!$request->user()) {
            return redirect()->route('login')
                ->with('message', 'You must be logged in to access this resource.');
        }

        $userRole = $request->user()->role;

        // Daftar seluruh role yang dikenal
        $validRoles = [
            'admin',
            'official_team',
            'judge',
            'committee',
        ];

        // Tolak role yang tidak dikenal
        if (!in_array($userRole, $validRoles, true)) {
            abort(403, 'Unknown user role.');
        }

        // Jika tidak ada role yang ditentukan,
        // semua pengguna dengan role valid diperbolehkan
        if (empty($roles)) {
            return $next($request);
        }

        // Periksa apakah role pengguna diizinkan
        if (!in_array($userRole, $roles, true)) {
            abort(403, 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
