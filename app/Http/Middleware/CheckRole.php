<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param string|array $roles  - Comma-separated or array of allowed roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // If no roles specified, allow all authenticated users
        if (empty($roles)) {
            return $next($request);
        }

        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login')
                ->with('message', 'You must be logged in to access this resource.');
        }

        $userRole = Auth::user()->role;

        // Check if user's role is in the allowed roles
        if (!in_array($userRole, $roles, strict: true)) {
            return redirect()->route('dashboard')
                ->with('error', 'You do not have permission to access this resource.');
        }

        return $next($request);
    }
}
