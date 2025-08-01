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
    FileCheck,
    Layers,
    Building,
    Leaf,
    Menu,
    X,
    ChevronLeft
} from 'lucide-react';
import MenuItem from './ui/MenuItem';
import DropdownSection from './ui/DropdownSection';

const Sidebar = () => {
    const [expandedSections, setExpandedSections] = useState({
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

                        <Link to="/reception" onClick={closeSidebar}>
                            <MenuItem
                                icon={UserCheck}
                                label="Reception"
                                isActive={isActive('/reception')}
                                isCollapsed={isCollapsed && !isHovered}
                            />
                        </Link>

                        <Link to="/export" onClick={closeSidebar}>
                            <MenuItem
                                icon={FileText}
                                label="Export"
                                isActive={isActive('/export')}
                                isCollapsed={isCollapsed && !isHovered}
                            />
                        </Link>

                        <Link to="/ecart" onClick={closeSidebar}>
                            <MenuItem
                                icon={ShoppingCart}
                                label="Ecart"
                                isActive={isActive('/ecart')}
                                isCollapsed={isCollapsed && !isHovered}
                            />
                        </Link>

                        <Link to="/gestion-utilisateur" onClick={closeSidebar}>
                            <MenuItem
                                icon={Users}
                                label="Gestion utilisateur"
                                isActive={isActive('/gestion-utilisateur')}
                                isCollapsed={isCollapsed && !isHovered}
                            />
                        </Link>

                        {/* Produit Section */}
                        <Link to="/produit" onClick={closeSidebar}>
                            <MenuItem
                                icon={Package}
                                label="Produit"
                                isCollapsed={isCollapsed && !isHovered}
                                isActive={isActive('/produit')}
                            />
                        </Link>

                        {/* Producteur Section */}
                        {(!isCollapsed || isHovered) && (
                            <>
                                <MenuItem
                                    icon={Users}
                                    label="Producteur"
                                    hasSubmenu={true}
                                    isExpanded={expandedSections.producteur}
                                    onClick={() => toggleSection('producteur')}
                                    isCollapsed={isCollapsed && !isHovered}
                                />

                                <DropdownSection isExpanded={expandedSections.producteur} isCollapsed={isCollapsed && !isHovered} >
                                    <Link to="/producteur" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={Building}
                                            label="Producteur"
                                            isSubItem={true}
                                            isActive={isActive('/producteur')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                    <Link to="/verger" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={TreePine}
                                            label="Verger"
                                            isSubItem={true}
                                            isActive={isActive('/verger')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                    <Link to="/parcelle" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={Map}
                                            label="Parcelle"
                                            isSubItem={true}
                                            isActive={isActive('/parcelle')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                    <Link to="/protocole" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={FileCheck}
                                            label="Protocole"
                                            isSubItem={true}
                                            isActive={isActive('/protocole')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                    <Link to="/declaration-verger" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={FileText}
                                            label="Declaration Verger"
                                            isSubItem={true}
                                            isActive={isActive('/declaration-verger')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                    <Link to="/base" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={Layers}
                                            label="Base"
                                            isSubItem={true}
                                            isActive={isActive('/base')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                    <Link to="/porte-greef" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={TreePine}
                                            label="Porte greef"
                                            isSubItem={true}
                                            isActive={isActive('/porte-greef')}
                                            isCollapsed={isCollapsed && !isHovered}
                                        />
                                    </Link>
                                    <Link to="/type-producteur" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={Users}
                                            label="Type de producteur"
                                            isSubItem={true}
                                            isActive={isActive('/type-producteur')}
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
                                    <Link to="/producteur" onClick={closeSidebar}>
                                        <MenuItem
                                            icon={Users}
                                            label="Producteur"
                                            isActive={isActive('/producteur')}
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