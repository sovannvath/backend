<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class WarehouseSeeder extends Seeder
{
    public function run(): void
    {
        // Get the Warehouse role
        $warehouseRole = Role::where('name', 'Warehouse')->first();
        
        if (!$warehouseRole) {
            throw new \Exception('Warehouse role not found. Please run RoleSeeder first.');
        }

        // Create warehouse user if it doesn't exist
        $warehouseUser = User::where('email', 'nysreynit123@gmail.com')->first();
        
        if (!$warehouseUser) {
            User::create([
                'name' => 'Warehouse User',
                'email' => 'nysreynit123@gmail.com',
                'password' => Hash::make('password'), // You can set a default password here
                'role_id' => $warehouseRole->id,
                'email_verified_at' => now(),
            ]);
            
            echo "Warehouse user created successfully.\n";
        } else {
            echo "Warehouse user already exists.\n";
        }
    }
}


