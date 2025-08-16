import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Users,
    FileText,
    ShoppingCart,
    UserCheck,
    Package,
    TreePine,
    Map,
    Layers,
    Building,
    Menu,
    X,
    ChevronLeft,
    BarChart3,
    TrendingUp,
    PieChart
} from 'lucide-react';
import MenuItem from './ui/MenuItem';
import DropdownSection from './ui/DropdownSection';

const Sidebar = () => {
    const [expandedSections, setExpandedSections] = useState({
        gestion: false,
        analytics: false,
        producteur: false,
        produit: false
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const location = useLocation();

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            // Mobile: toggle open/close
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            // Desktop: toggle collapsed/expanded
            setIsCollapsed(!isCollapsed);
        }
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const isPathActive = (basePath) => {
        return location.pathname.startsWith(basePath);
    };

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={toggleSidebar}
                className={`fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 transition-all duration-200 hover:scale-105 active:scale-95 flex lg:hidden items-center justify-center ${isSidebarOpen ? 'lg:left-64' : 'lg:left-4'
                    }`}
                aria-label="Toggle menu"
            >
                <div className="relative">
                    <Menu
                        size={20}
                        className={`w-5 h-5 text-gray-600 transition-all duration-300 ${isSidebarOpen
                            ? 'opacity-0 rotate-90 scale-0'
                            : 'opacity-100 rotate-0 scale-100'
                            }`}
                    />
                    <X
                        size={20}
                        className={`w-5 h-5 text-gray-600 absolute inset-0 transition-all duration-300 ${isSidebarOpen
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 rotate-90 scale-0'
                            }`}
                    />
                </div>
            </button>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Desktop collapse button */}
            <button
                className={`fixed top-9 w-9 h-9 bg-background-100 rounded-full z-[60] hidden lg:flex items-center justify-center transition-all duration-500 ease-in-out
                    ${(isCollapsed && !isHovered) ? 'left-12' : 'left-60'}`}>
                <div
                    onClick={toggleSidebar}
                    className={`bg-primary-500 w-6 h-6 hover:bg-primary-600 text-white rounded-full shadow-md z-[60] flex items-center justify-center transition-all duration-500 ease-in-out`}
                >
                    <ChevronLeft
                        size={16}
                        className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen z-40 overflow-y-auto
                    bg-white border-r border-gray-200
                    transition-all duration-500 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                    lg:translate-x-0 lg:static lg:z-auto
                    ${(isCollapsed && !isHovered) ? 'w-16' : 'w-64'}
                    [&::-webkit-scrollbar]:w-2 
                    [&::-webkit-scrollbar-track]:bg-gray-100 
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:hover:bg-gray-400
                `}
                onMouseEnter={() => {
                    if (isCollapsed && window.innerWidth >= 1024) {
                        setIsHovered(true);
                    }
                }}
                onMouseLeave={() => {
                    if (isCollapsed && window.innerWidth >= 1024) {
                        setIsHovered(false);
                    }
                }}
            >
                <div className={`p-4 mt-10 lg:mt-0 transition-all duration-500 ease-in-out ${(isCollapsed && !isHovered) ? 'px-2' : ''}`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mt-5 px-1">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 hover:bg-primary-600">
                                <span className="text-white font-bold text-lg">D</span>
                            </div>
                            <span className={`text-xl font-bold text-gray-800 transition-all duration-500 ease-in-out ${(!isCollapsed || isHovered)
                                ? 'opacity-100 translate-x-0 scale-100'
                                : 'opacity-0 -translate-x-4 scale-95'
                                }`}>
                                Dashboard
                            </span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="mt-6">
                        <Link to="/" onClick={closeSidebar}>
                            <MenuItem
                                icon={Home}
                                label="Dashboard"
                                isActive={isActive('/')}
                                isCollapsed={isCollapsed && !isHovered}
                            />
                        </Link>

                        {/* Gestion Section */}
                        {(!isCollapsed || isHovered) && (
                            <>
                                <MenuItem
                                    icon={Users}
                                    label="Gestion"
                                    hasSubmenu={true}
                                    isExpanded={expandedSections.gestion}
                                    onClick={() => toggleSection('gestion')}
                                    isCollapsed={isCollapsed && !isHovered}
                                    isActive={isPathActive('/gestion')}
                                />

                                <DropdownSection isExpanded={expandedSections.gestion} isCollapsed={isCollapsed && !isHovered}>
                                    <Link to="/gestion/reception" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={UserCheck}
                                            label="Reception"
                                            isSubItem={true}
                                            isActive={isActive('/gestion/reception')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>

                                    <Link to="/gestion/export" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={FileText}
                                            label="Export"
                                            isSubItem={true}
                                            isActive={isActive('/gestion/export')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>

                                    <Link to="/gestion/ecart" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={ShoppingCart}
                                            label="Ecart"
                                            isSubItem={true}
                                            isActive={isActive('/gestion/ecart')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>

                                    <Link to="/gestion/gestion-utilisateur" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={Users}
                                            label="Gestion utilisateur"
                                            isSubItem={true}
                                            isActive={isActive('/gestion/gestion-utilisateur')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>

                                    <Link to="/gestion/produit" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={Package}
                                            label="Produit"
                                            isSubItem={true}
                                            isActive={isActive('/gestion/produit')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>

                                    {/* Producteur Submenu */}
                                    <MenuItem
                                        icon={Users}
                                        label="Producteur"
                                        hasSubmenu={true}
                                        isExpanded={expandedSections.producteur}
                                        onClick={() => toggleSection('producteur')}
                                        isCollapsed={isCollapsed && !isHovered}
                                        isSubItem={true}
                                        isActive={isPathActive('/gestion/producteur') || isPathActive('/gestion/verger') || isPathActive('/gestion/parcelle')}
                                    />

                                    <DropdownSection isExpanded={expandedSections.producteur} isCollapsed={isCollapsed && !isHovered} isNested={true}>
                                        <Link to="/gestion/producteur" onClick={closeSidebar}>
                                            <MenuItem
                                                icon={Building}
                                                label="Producteur"
                                                isSubItem={true}
                                                isActive={isActive('/gestion/producteur')}
                                                isCollapsed={isCollapsed && !isHovered}
                                                isNested={true}
                                            />
                                        </Link>
                                        <Link to="/gestion/verger" onClick={closeSidebar}>
                                            <MenuItem
                                                icon={TreePine}
                                                label="Verger"
                                                isSubItem={true}
                                                isActive={isActive('/gestion/verger')}
                                                isCollapsed={isCollapsed && !isHovered}
                                                isNested={true}
                                            />
                                        </Link>
                                        <Link to="/gestion/parcelle" onClick={closeSidebar}>
                                            <MenuItem
                                                icon={Map}
                                                label="Parcelle"
                                                isSubItem={true}
                                                isActive={isActive('/gestion/parcelle')}
                                                isCollapsed={isCollapsed && !isHovered}
                                                isNested={true}
                                            />
                                        </Link>
                                        <Link to="/gestion/declaration-verger" onClick={closeSidebar}>
                                            <MenuItem
                                                icon={FileText}
                                                label="Declaration Verger"
                                                isSubItem={true}
                                                isActive={isActive('/gestion/declaration-verger')}
                                                isCollapsed={isCollapsed && !isHovered}
                                                isNested={true}
                                            />
                                        </Link>
                                        <Link to="/gestion/certificat" onClick={closeSidebar}>
                                            <MenuItem
                                                icon={FileText}
                                                label="Certificats"
                                                isSubItem={true}
                                                isActive={isActive('/gestion/certificat')}
                                                isCollapsed={isCollapsed && !isHovered}
                                                isNested={true}
                                            />
                                        </Link>
                                        <Link to="/gestion/organisme" onClick={closeSidebar}>
                                            <MenuItem
                                                icon={Building}
                                                label="Organismes"
                                                isSubItem={true}
                                                isActive={isActive('/gestion/organisme')}
                                                isCollapsed={isCollapsed && !isHovered}
                                                isNested={true}
                                            />
                                        </Link>
                                        <Link to="/gestion/base" onClick={closeSidebar}>
                                            <MenuItem
                                                icon={Layers}
                                                label="Base"
                                                isSubItem={true}
                                                isActive={isActive('/gestion/base')}
                                                isCollapsed={isCollapsed && !isHovered}
                                                isNested={true}
                                            />
                                        </Link>
                                    </DropdownSection>
                                </DropdownSection>
                            </>
                        )}

                        {/* Analytics Section */}
                        {(!isCollapsed || isHovered) && (
                            <>
                                <MenuItem
                                    icon={BarChart3}
                                    label="Analytics"
                                    hasSubmenu={true}
                                    isExpanded={expandedSections.analytics}
                                    onClick={() => toggleSection('analytics')}
                                    isCollapsed={isCollapsed && !isHovered}
                                    isActive={isPathActive('/analytics')}
                                />

                                <DropdownSection isExpanded={expandedSections.analytics} isCollapsed={isCollapsed && !isHovered}>
                                    <Link to="/analytics" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={TrendingUp}
                                            label="Dashboard"
                                            isSubItem={true}
                                            isActive={isActive('/analytics') || isActive('/analytics/')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                    <Link to="/analytics/reports" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={FileText}
                                            label="Reports"
                                            isSubItem={true}
                                            isActive={isActive('/analytics/reports')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                    <Link to="/analytics/metrics" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={PieChart}
                                            label="Metrics"
                                            isSubItem={true}
                                            isActive={isActive('/analytics/metrics')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                </DropdownSection>
                            </>
                        )}

                        {/* Collapsed state - show main icons only */}
                        {(isCollapsed && !isHovered) && (
                            <>
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <Link to="/gestion" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={Users}
                                            label="Gestion"
                                            isActive={isPathActive('/gestion')}
                                            isCollapsed={true}
                                            showTooltip={true}
                                        />
                                    </Link>

                                    <Link to="/analytics" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={BarChart3}
                                            label="Analytics"
                                            isActive={isPathActive('/analytics')}
                                            isCollapsed={true}
                                            showTooltip={true}
                                        />
                                    </Link>
                                </div>
                            </>
                        )}
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;