<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TempFileController extends Controller
{
    public function storeTemp(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB Maks (Sesuaikan)
        ]);

        // Simpan ke disk public, folder 'temp'
        $path = $request->file('file')->store('temp', 'public');

        return response()->json([
            'status' => 'success',
            'path' => $path, // path ini yang akan diterima komponen React (contoh: temp/abcd.jpg)
        ]);
    }
}