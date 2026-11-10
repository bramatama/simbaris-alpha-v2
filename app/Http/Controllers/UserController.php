<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Membatasi pengelolaan akun hanya untuk administrator.
     */
    public function __construct()
    {
        // Jika user belum login atau role-nya bukan admin, langsung banting 403 Forbidden
        abort_if(auth()->user()?->role !== 'admin', 403, 'Akses ditolak: Fitur ini khusus untuk Super Admin.');
    }
    
    /**
     * Menampilkan daftar akun yang dapat dikelola administrator.
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

        return inertia('users/Index', [
            'users' => $users,
            'filters' => $request->only(['role']),
        ]);
    }

    /**
     * Menghapus satu akun selain akun administrator yang sedang aktif.
     */
    public function destroy(User $user)
    {
        $currentUserId = auth()->user()?->user_id;
        if ($user->user_id === $currentUserId) {
            return redirect()->back()
                ->with('error', 'Anda tidak bisa menghapus akun anda sendiri');
        }

        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Pengguna berhasil dihapus');
    }

    /** Menghapus beberapa akun yang dipilih administrator. */
    public function destroyMany(Request $request)
    {
        $currentUserId = auth()->user()?->user_id;
        $request->validate([
            'user_ids' => 'required|array|min:1', 'user_ids.*' => 'exists:users,user_id', 
        ]);

        if (in_array($currentUserId, $request->user_ids)) {
            return redirect()->back() ->with('error', 'Anda tidak bisa menghapus akun anda sendiri');
        }
        User::whereIn('user_id', $request->user_ids)->delete(); 
        
        return redirect() ->route('admin.users.index')
        ->with('success', 'Pengguna terpilih berhasil dihapus');
    }
}
