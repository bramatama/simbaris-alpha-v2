<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        return Inertia::render('settings/profile', [
            'user' => $user->only(['user_id', 'public_id', 'name', 'email', 'role', 'contact_info', 'profile_picture_path']),
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();       
        $user->fill($request->validated());

        if ($request->filled('temp_photo_path')) {
        $tempPath = $request->input('temp_photo_path');

        if (Storage::disk('public')->exists($tempPath)) {
            
            if ($user->profile_picture_path && Storage::disk('public')->exists($user->profile_picture_path)) {
                Storage::disk('public')->delete($user->profile_picture_path);
            }

            $extension = pathinfo($tempPath, PATHINFO_EXTENSION);
            $newPath = 'profile_photos/' . Str::random(20) . '.' . $extension;
            
            Storage::disk('public')->move($tempPath, $newPath);

            $user->profile_picture_path = $newPath;
        }
    }
        
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
            $user->save();

            $user->sendEmailVerificationNotification();
            return to_route('dashboard');
        }
        else{
            $user->save();
            return to_route('profile.edit')->with('success', 'Profile updated successfully.');
        }
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();
        
        if ($user->profile_picture_path) {
            Storage::disk('public')->delete($user->profile_picture_path);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
