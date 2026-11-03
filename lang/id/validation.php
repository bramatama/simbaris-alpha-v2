
<?php

return [
    'accepted' => ':attribute harus disetujui.',
    'required' => ':attribute wajib diisi.',
    'required_if' => ':attribute wajib diisi.',
    'string' => ':attribute harus berupa teks.',
    'integer' => ':attribute harus berupa angka bulat.',
    'numeric' => ':attribute harus berupa angka.',
    'email' => ':attribute harus berupa alamat email yang valid.',
    'boolean' => ':attribute harus bernilai benar atau salah.',
    'array' => ':attribute harus berupa kumpulan data.',
    'date' => ':attribute harus berupa tanggal yang valid.',

    'min' => [
        'string' => ':attribute minimal harus terdiri dari :min karakter.',
        'numeric' => ':attribute minimal harus bernilai :min.',
        'array' => ':attribute minimal harus memiliki :min item.',
        'file' => ':attribute minimal berukuran :min kilobyte.',
    ],

    'max' => [
        'string' => ':attribute maksimal terdiri dari :max karakter.',
        'numeric' => ':attribute maksimal bernilai :max.',
        'array' => ':attribute maksimal memiliki :max item.',
        'file' => ':attribute maksimal berukuran :max kilobyte.',
    ],

    'unique' => ':attribute sudah digunakan.',
    'exists' => ':attribute yang dipilih tidak valid.',
    'confirmed' => 'Konfirmasi :attribute tidak cocok.',
    'same' => ':attribute harus sama dengan :other.',
    'different' => ':attribute harus berbeda dengan :other.',
    'in' => ':attribute yang dipilih tidak valid.',
    'not_in' => ':attribute yang dipilih tidak valid.',
    'image' => ':attribute harus berupa gambar.',
    'mimes' => ':attribute harus berupa file bertipe: :values.',
    'mimetypes' => ':attribute harus berupa file bertipe: :values.',
    'file' => ':attribute harus berupa file.',
    'url' => ':attribute harus berupa URL yang valid.',
    'regex' => 'Format :attribute tidak valid.',
    'digits' => ':attribute harus terdiri dari :digits digit.',
    'after' => ':attribute harus merupakan tanggal setelah :date.',
    'before' => ':attribute harus merupakan tanggal sebelum :date.',

    'custom' => [],

    
    'attributes' => [
        'name' => 'nama',
        'email' => 'email',
        'password' => 'kata sandi',

        'event_name' => 'nama event',
        'event_date' => 'tanggal event',
        'event_location' => 'lokasi event',

        'team_name' => 'nama tim',
        'participant_name' => 'nama peserta',

        'master_category_id' => 'kategori penilaian',
        'event_level_ids' => 'jenjang lomba',
        'scoring_category_id' => 'kategori penilaian',
        'judge_id' => 'juri',
        'prize_money' => 'uang pembinaan',
        'certificate' => 'sertifikat',

        'methods' => 'metode pembayaran',
        'methods.*.type' => 'jenis pembayaran',
        'methods.*.bank_name' => 'nama bank',
        'methods.*.account_number' => 'nomor rekening',
        'methods.*.account_holder' => 'nama pemilik rekening',
        'methods.*.temp_qris_path' => 'gambar QRIS',
        'methods.*.is_active' => 'status metode pembayaran',
    ],

];
