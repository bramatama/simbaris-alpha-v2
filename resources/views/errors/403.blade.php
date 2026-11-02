<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Akses Ditolak | SIMBARIS</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-900 flex items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center space-y-6">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl font-bold text-xl shadow-xs">
            403
        </div>
        <div class="space-y-2">
            <span class="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                Akses Ditolak
            </span>
            <h1 class="text-xl font-bold tracking-tight">Tidak Memiliki Hak Akses</h1>
            <p class="text-xs text-slate-500 leading-relaxed">
                @if (isset($exception) && $exception->getMessage())
                    {{ $exception->getMessage() }}
                @else
                    Maaf, peran akun Anda tidak diizinkan untuk mengakses halaman atau fitur khusus ini di SIMBARIS.
                @endif
            </p>
        </div>
        <div class="pt-2 flex flex-col gap-2">
            <a href="javascript:history.back()" class="w-full px-4 py-2.5 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors">
                Kembali ke Halaman Sebelumnya
            </a>
            <a href="/dashboard" class="w-full px-4 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-indigo-700 transition-colors">
                Ke Dashboard Utama
            </a>
        </div>
    </div>
</body>
</html>