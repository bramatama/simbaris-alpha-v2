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
        if ($request->hasFile('photo')) {
            if ($user->profile_picture_path) {
                Storage::disk('public')->delete($user->profile_picture_path);
            }

            // 2. Simpan foto baru ke dalam folder 'profile-photos' (otomatis terbuat)
            $path = $request->file('photo')->store('profile-photos', 'public');
            
            // 3. Simpan nama path file-nya ke database
            $user->profile_picture_path = $path;
        }
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
            $user->save();

            $user->sendEmailVerificationNotification();
            return to_route('dashboard');
        }
        else{
            $user->save();
            return to_route('profile.edit')->with('status', 'Profile updated successfully.');
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
