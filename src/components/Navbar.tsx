import { Link, useLocation } from 'react-router-dom';
import { Users, CreditCard, TrendingUp, Package, Store } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/customers', label: 'Customers', icon: Users },
        { path: '/debts', label: 'Debts', icon: CreditCard },
        { path: '/advances', label: 'Advances', icon: TrendingUp },
        { path: '/items', label: 'Items', icon: Package },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed left-0 top-0 h-screen w-64 bg-sidebar shadow-xl flex flex-col border-r border-sidebar-border">
            {/* Logo */}
            <div className="p-6 border-b border-sidebar-border">
                <Link to="/" className="flex items-center space-x-3 text-sidebar-primary font-bold text-xl">
                    <Store className="w-8 h-8" />
                    <span>Retail Shop</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-6 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)
                                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border">
                <p className="text-xs text-sidebar-foreground/70 text-center">© 2025 Retail Shop</p>
            </div>
        </nav>
    );
};

export default Navbar;
