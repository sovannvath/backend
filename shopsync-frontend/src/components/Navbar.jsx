import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, LogOut, Package, Users, Warehouse } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const getRoleBasedLinks = () => {
    const links = [];
    
    if (user.role?.name === 'Admin') {
      links.push(
        { to: '/admin', label: 'Admin Panel', icon: Users },
        { to: '/products', label: 'Products', icon: Package }
      );
    } else if (user.role?.name === 'Staff') {
      links.push(
        { to: '/staff', label: 'Staff Panel', icon: Users },
        { to: '/products', label: 'Products', icon: Package }
      );
    } else if (user.role?.name === 'Warehouse') {
      links.push(
        { to: '/warehouse', label: 'Warehouse Panel', icon: Warehouse },
        { to: '/products', label: 'Products', icon: Package }
      );
    } else {
      links.push(
        { to: '/products', label: 'Products', icon: Package },
        { to: '/cart', label: 'Cart', icon: ShoppingCart }
      );
    }
    
    return links;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              ShopSync
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {getRoleBasedLinks().map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} className="flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

