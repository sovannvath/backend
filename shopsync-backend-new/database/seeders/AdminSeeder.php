<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Get the Admin role
        $adminRole = Role::where('name', 'Admin')->first();
        
        if (!$adminRole) {
            throw new \Exception('Admin role not found. Please run RoleSeeder first.');
        }

        // Create admin user if it doesn't exist
        $adminUser = User::where('email', 'sovannvath69@gmail.com')->first();
        
        if (!$adminUser) {
            User::create([
                'name' => 'Admin User',
                'email' => 'sovannvath69@gmail.com',
                'password' => Hash::make('0885778248'),
                'role_id' => $adminRole->id,
                'email_verified_at' => now(),
            ]);
            
            echo "Admin user created successfully.\n";
        } else {
            echo "Admin user already exists.\n";
        }
    }
}

