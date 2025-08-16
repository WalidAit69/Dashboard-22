import React from 'react'

const DropdownSection = ({ isExpanded, children, isCollapsed = false }) => {
    // Don't render dropdown in collapsed state
    if (isCollapsed) return null;

    return (
        <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}
        >
            <div className={`bg-gray-50 rounded-lg transform transition-all duration-500 ease-in-out ${isExpanded
                ? 'translate-y-0 scale-100'
                : '-translate-y-2 scale-95'
                }`}>
                <div className={`transition-all duration-500 ease-in-out ${isExpanded
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 -translate-x-4 scale-95'
                    }`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DropdownSection;