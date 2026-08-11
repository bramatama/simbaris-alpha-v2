<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->with(['officialTeam', 'committee', 'judge'])
            ->where('user_id', '!=', auth()->id())
            ->orderBy('created_at', 'desc');

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        $users = $query->paginate(15)->withQueryString();

        return inertia('admin/UserManagement/Index', [
            'users' => $users,
            'filters' => $request->only(['role']),
        ]);
    }

    public function show(User $user)
    {
        return inertia('admin/UserManagement/Show', [
            'user' => $user->only(['user_id', 'public_id', 'name', 'email', 'role', 'contact_info']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $currentUserId = auth()->user()?->user_id;
        if ($user->user_id === $currentUserId) {
            return redirect()->back()
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('message', 'User deleted successfully.');
    }
}
