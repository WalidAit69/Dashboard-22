import { ChevronRight } from 'lucide-react';

const MenuItem = ({ icon: Icon, label, hasSubmenu = false, isExpanded = false, onClick, isSubItem = false, isActive = false }) => (
    <div
        className={`flex items-center justify-between px-2 py-3 cursor-pointer hover:bg-gray-100 transition-all duration-200 ease-in-out ${isSubItem ? 'pl-12 py-2' : ''
            } ${isActive ? 'bg-primary-50 border-r-2 border-primary-500' : ''}`}
        onClick={onClick}
    >
        <div className="flex items-center space-x-3">
            <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary-500' : 'text-gray-600'}`} />
            <span className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-primary-500' : 'text-gray-700'}`}>
                {label}
            </span>
        </div>
        {hasSubmenu && (
            <div className="text-gray-400">
                <ChevronRight
                    className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-90' : 'rotate-0'
                        }`}
                />
            </div>
        )}
    </div>
);

export default MenuItem