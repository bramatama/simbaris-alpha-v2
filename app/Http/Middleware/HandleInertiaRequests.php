<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $userAgent = $request->header('User-Agent');
        $isMobileDevice = preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i', $userAgent);
        $user = $request->user();
        $userData = null;

        if ($user) {
            $userData = $user->only([
                'public_id',
                'name',
                'email',
                'role',
                'profile_picture_path'
            ]);

            if ($user->role === 'committee') {
                $committeePosition = null;

                $eventParam = $request->route('event') ?? $request->route('public_id');

                if ($eventParam) {
                    $eventPublicId = is_object($eventParam) ? $eventParam->public_id : $eventParam;

                    $committeePosition = \App\Models\EventCommittee::whereHas('event', function ($q) use ($eventPublicId) {
                            $q->where('public_id', $eventPublicId);
                        })
                        ->whereHas('committee', function ($q) use ($user) {
                            $q->where('user_id', $user->user_id);
                        })
                        ->value('position');
                }

                if (!$committeePosition) {
                    $committeePosition = $user->committee?->eventCommittees()->latest()->first()?->position 
                        ?? $user->committee?->department;
                }

                $userData['committee_position'] = $committeePosition;
            }
        }
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $userData,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'isMobileDevice' => (bool) $isMobileDevice,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'message' => fn () => $request->session()->get('message'),
            ],
            'url' => $request->url(),
        ];
    }
}
