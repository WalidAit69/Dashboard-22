import { useState } from 'react';
import { Users, TreePine, FileText, Menu, X } from 'lucide-react';
import TypeProducteur from './TypeProducteur';
import PorteGreffe from './PorteGreffe';
import Protocole from './Protocoles';

function BasesPage() {
    const [activeTab, setActiveTab] = useState('typeProducteur');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigationItems = [
        { id: 'typeProducteur', label: 'Type de Producteur', icon: Users },
        { id: 'porteGreffe', label: 'Porte Greffe', icon: TreePine },
        { id: 'protocole', label: 'Protocole', icon: FileText },
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSidebarOpen(false); // Fermer le menu mobile après sélection
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'typeProducteur':
                return <TypeProducteur />;
            case 'porteGreffe':
                return <PorteGreffe />;
            case 'protocole':
                return <Protocole />;
            default:
                return (
                    <div className="p-4 sm:p-6">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            {navigationItems.find(item => item.id === activeTab)?.label}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">Cette section n'est pas encore implémentée.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen mt-10">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white rounded-2xl px-4 py-3 shadow-sm mb-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-gray-900">Bases</h1>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95"
                        aria-label="Toggle menu"
                    >
                        <div className="relative">
                            <Menu
                                size={20}
                                className={`transition-all duration-300 ${sidebarOpen
                                    ? 'opacity-0 rotate-90 scale-0'
                                    : 'opacity-100 rotate-0 scale-100'
                                    }`}
                            />
                            <X
                                size={20}
                                className={`absolute inset-0 transition-all duration-300 ${sidebarOpen
                                    ? 'opacity-100 rotate-0 scale-100'
                                    : 'opacity-0 rotate-90 scale-0'
                                    }`}
                            />
                        </div>
                    </button>
                </div>

                {/* Mobile Tab Navigation */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${sidebarOpen
                    ? 'max-h-96 opacity-100 mt-4 pb-2'
                    : 'max-h-0 opacity-0 mt-0 pb-0'
                    }`}>
                    <nav className="space-y-1">
                        {navigationItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-300 touch-manipulation transform hover:scale-[1.02] active:scale-[0.98] ${isActive
                                        ? 'bg-primary-100 text-primary-700 font-medium shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200'
                                        }`}
                                    style={{
                                        transitionDelay: sidebarOpen ? `${index * 50}ms` : '0ms'
                                    }}
                                >
                                    <Icon
                                        size={20}
                                        className={`transition-all duration-300 ${isActive
                                            ? 'text-primary-600 scale-110'
                                            : 'scale-100'
                                            }`}
                                    />
                                    <span className="text-base">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="max-w-7xl mx-auto flex items-start">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block w-64 min-h-screen">
                    <div className="p-6">
                        <h1 className="text-xl font-semibold text-gray-900 mb-6">Bases</h1>

                        <nav className="space-y-2">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:translate-x-1 ${isActive
                                            ? 'bg-primary-100 text-primary-700 font-medium shadow-sm scale-[1.02] translate-x-1'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon
                                            size={18}
                                            className={`transition-all duration-300 ${isActive
                                                ? 'text-primary-600 scale-110 rotate-12'
                                                : 'scale-100 rotate-0 group-hover:scale-105'
                                                }`}
                                        />
                                        <span className={`transition-all duration-300 ${isActive ? 'font-semibold' : 'font-normal'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white shadow-soft rounded-xl">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default BasesPage;