import { ChevronRight } from 'lucide-react';

const MenuItem = ({ 
    icon: Icon, 
    label, 
    hasSubmenu = false, 
    isExpanded = false, 
    onClick, 
    isSubItem = false, 
    isActive = false, 
    isCollapsed = false,
    showTooltip = false 
}) => (
    <div className="relative group">
        <div
            className={`flex items-center justify-between px-2 py-3 cursor-pointer hover:bg-gray-100 transition-all duration-500 ease-in-out ${
                isSubItem ? 'pl-12 py-2' : ''
            } ${
                isActive ? 'bg-primary-50 border-r-2 border-primary-500' : ''
            } ${
                isCollapsed ? 'justify-center px-2' : ''
            }`}
            onClick={onClick}
        >
            <div className={`flex items-center transition-all duration-500 ease-in-out ${
                isCollapsed ? 'justify-center' : 'space-x-3'
            }`}>
                <Icon className={`w-5 h-5 transition-all duration-500 ease-in-out ${
                    isActive ? 'text-primary-500' : 'text-gray-600'
                } ${
                    isCollapsed ? 'mx-auto scale-110' : 'scale-100'
                }`} />
                <span className={`text-sm font-medium transition-all duration-500 ease-in-out ${
                    isActive ? 'text-primary-500' : 'text-gray-700'
                } ${
                    !isCollapsed 
                        ? 'opacity-100 translate-x-0 scale-100' 
                        : 'opacity-0 -translate-x-4 scale-95 w-0 overflow-hidden'
                }`}>
                    {label}
                </span>
            </div>
            {hasSubmenu && !isCollapsed && (
                <div className={`text-gray-400 transition-all duration-500 ease-in-out ${
                    !isCollapsed 
                        ? 'opacity-100 translate-x-0 scale-100' 
                        : 'opacity-0 translate-x-4 scale-95'
                }`}>
                    <ChevronRight
                        className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                            isExpanded ? 'rotate-90' : 'rotate-0'
                        }`}
                    />
                </div>
            )}
        </div>
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && showTooltip && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap z-50 pointer-events-none">
                {label}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
            </div>
        )}
    </div>
);

export default MenuItem;