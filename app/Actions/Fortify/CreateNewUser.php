<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        // Determine the role for the new user
        // Guest users registering via public page default to 'official_team'
        // Authenticated users (admin/committee) can register other roles
        $role = $input['role'] ?? 'official_team';
        
        // Guest can only register as official_team
        if (!Auth::check() && $role !== 'official_team') {
            throw new \InvalidArgumentException('Unauthorized role selection');
        }

        // Build validation rules based on role and context
        $validationRules = [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ];

         // Add role-specific validation rules
        switch ($role) {
            case 'official_team':
                $validationRules = array_merge($validationRules, [
                    'institution' => ['required', 'string', 'max:255'],
                    'province' => ['required', 'string', 'max:255'],
                    'city' => ['required', 'string', 'max:255'],
                ]);
                break;

            case 'committee':
                $validationRules = array_merge($validationRules, [
                    'department' => ['required', 'string', 'max:255'],
                ]);
                break;

            case 'judge':
                // Judges only need basic information
                break;

            case 'admin':
                // Admins only need basic information
                break;
        }

        Validator::make($input, $validationRules)->validate();
        
        return DB::transaction(function() use ($input, $role) {

            $user = User::create([
                'public_id' => Str::uuid(),
                'name' => $input['name'],
                'email' => $input['email'],
                'role' => $role,
                'contact_info' => $input['contact_info'],
                'password' => $input['password'],
            ]);
            
            // Create role-specific record based on the selected role
            switch ($role) {
                case 'admin':
                    $user->admin()->create();
                    break;
                    
                case 'official_team':
                    $user->officialTeam()->create([
                        'institution' => $input['institution'],
                        'province' => $input['province'],
                        'city' => $input['city'],
                        ]);
                        break;
                        
                case 'judge':
                    $user->judge()->create();
                    break;
                            
                case 'committee':
                    $user->committee()->create([
                        'department' => $input['department'],
                        ]);
                    break;
                }
                return $user;
        });
    }
}
