import React from 'react'

const DropdownSection = ({ isExpanded, children }) => (
    <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
    >
        <div className={`bg-gray-50 rounded-lg transform transition-transform duration-300 ease-in-out ${isExpanded ? 'translate-y-0' : '-translate-y-2'
            }`}>
            {children}
        </div>
    </div>
);

export default DropdownSection