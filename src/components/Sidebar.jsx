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
    X
} from 'lucide-react';
import MenuItem from './ui/MenuItem';
import DropdownSection from './ui/DropdownSection';

const Sidebar = () => {
    const [expandedSections, setExpandedSections] = useState({
        producteur: false,
        produit: false
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const location = useLocation();

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            <button
                onClick={toggleSidebar}
                className={`fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 transition-all duration-200 flex lg:hidden items-center justify-center ${isSidebarOpen ? 'lg:left-64' : 'lg:left-4'
                    }`}
            >
                {isSidebarOpen ? (
                    <X className="w-5 h-5 text-gray-600" />
                ) : (
                    <Menu className="w-5 h-5 text-gray-600" />
                )}
            </button>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 overflow-y-auto 
                [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0 lg:static
                `}>

                <div className="p-4 mt-10 lg:mt-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mt-5 px-1">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 hover:bg-primary-600">
                                <span className="text-white font-bold text-lg">D</span>
                            </div>
                            <span className="text-xl font-bold text-gray-800">Dashboard</span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="mt-6">
                        <Link to="/" onClick={closeSidebar}>
                            <MenuItem
                                icon={Home}
                                label="Dashboard"
                                isActive={isActive('/')}
                            />
                        </Link>

                        <Link to="/reception" onClick={closeSidebar}>
                            <MenuItem
                                icon={UserCheck}
                                label="Reception"
                                isActive={isActive('/reception')}
                            />
                        </Link>

                        <Link to="/export" onClick={closeSidebar}>
                            <MenuItem
                                icon={FileText}
                                label="Export"
                                isActive={isActive('/export')}
                            />
                        </Link>

                        <Link to="/ecart" onClick={closeSidebar}>
                            <MenuItem
                                icon={ShoppingCart}
                                label="Ecart"
                                isActive={isActive('/ecart')}
                            />
                        </Link>

                        <Link to="/gestion-utilisateur" onClick={closeSidebar}>
                            <MenuItem
                                icon={Users}
                                label="Gestion utilisateur"
                                isActive={isActive('/gestion-utilisateur')}
                            />
                        </Link>

                        {/* Producteur Section */}
                        <MenuItem
                            icon={Users}
                            label="Producteur"
                            hasSubmenu={true}
                            isExpanded={expandedSections.producteur}
                            onClick={() => toggleSection('producteur')}
                        />

                        <DropdownSection isExpanded={expandedSections.producteur}>
                            <Link to="/producteur" onClick={closeSidebar}>
                                <MenuItem
                                    icon={Building}
                                    label="Producteur"
                                    isSubItem={true}
                                    isActive={isActive('/producteur')}
                                />
                            </Link>
                            <Link to="/verger" onClick={closeSidebar}>
                                <MenuItem
                                    icon={TreePine}
                                    label="Verger"
                                    isSubItem={true}
                                    isActive={isActive('/verger')}
                                />
                            </Link>
                            <Link to="/parcelle" onClick={closeSidebar}>
                                <MenuItem
                                    icon={Map}
                                    label="Parcelle"
                                    isSubItem={true}
                                    isActive={isActive('/parcelle')}
                                />
                            </Link>
                            <Link to="/protocole" onClick={closeSidebar}>
                                <MenuItem
                                    icon={FileCheck}
                                    label="Protocole"
                                    isSubItem={true}
                                    isActive={isActive('/protocole')}
                                />
                            </Link>
                            <Link to="/declaration-verger" onClick={closeSidebar}>
                                <MenuItem
                                    icon={FileText}
                                    label="Declaration Verger"
                                    isSubItem={true}
                                    isActive={isActive('/declaration-verger')}
                                />
                            </Link>
                            <Link to="/base" onClick={closeSidebar}>
                                <MenuItem
                                    icon={Layers}
                                    label="Base"
                                    isSubItem={true}
                                    isActive={isActive('/base')}
                                />
                            </Link>
                            <Link to="/porte-greef" onClick={closeSidebar}>
                                <MenuItem
                                    icon={TreePine}
                                    label="Porte greef"
                                    isSubItem={true}
                                    isActive={isActive('/porte-greef')}
                                />
                            </Link>
                            <Link to="/type-producteur" onClick={closeSidebar}>
                                <MenuItem
                                    icon={Users}
                                    label="Type de producteur"
                                    isSubItem={true}
                                    isActive={isActive('/type-producteur')}
                                />
                            </Link>
                        </DropdownSection>

                        {/* Produit Section */}
                        <MenuItem
                            icon={Package}
                            label="Produit"
                            hasSubmenu={true}
                            isExpanded={expandedSections.produit}
                            onClick={() => toggleSection('produit')}
                        />

                        <DropdownSection isExpanded={expandedSections.produit}>
                            <Link to="/culture" onClick={closeSidebar}>
                                <MenuItem
                                    icon={Leaf}
                                    label="Culture"
                                    isSubItem={true}
                                    isActive={isActive('/culture')}
                                />
                            </Link>
                            <Link to="/group-variete" onClick={closeSidebar}>
                                <MenuItem
                                    icon={Layers}
                                    label="Group variete"
                                    isSubItem={true}
                                    isActive={isActive('/group-variete')}
                                />
                            </Link>
                            <Link to="/variete" onClick={closeSidebar}>
                                <MenuItem
                                    icon={Package}
                                    label="Variete"
                                    isSubItem={true}
                                    isActive={isActive('/variete')}
                                />
                            </Link>
                            <Link to="/sous-variete" onClick={closeSidebar}>
                                <MenuItem
                                    icon={Package}
                                    label="Sous Variete"
                                    isSubItem={true}
                                    isActive={isActive('/sous-variete')}
                                />
                            </Link>
                        </DropdownSection>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar;