import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const AccordionCheckbox = ({
    label,
    options = [],
    selectedValues = [],
    onChange,
    disabled = false,
    placeholder = "Aucune option disponible"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [contentHeight, setContentHeight] = useState(0);
    const contentRef = useRef(null);

    // Update content height when options change or accordion opens/closes
    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
        }
    }, [isOpen, options, searchTerm]);

    const toggleAccordion = () => {
        if (!disabled) {
            setIsOpen(prev => !prev);
        }
    };

    const handleCheckboxChange = (value, checked) => {
        let newValues;
        if (checked) {
            newValues = [...selectedValues, value];
        } else {
            newValues = selectedValues.filter(v => v !== value);
        }
        onChange(newValues);
    };

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectAll = () => {
        onChange(filteredOptions.map(option => option.value));
    };

    const clearAll = () => {
        onChange([]);
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transform transition-all duration-300 hover:shadow-md hover:scale-[1.02]">
            <button
                onClick={toggleAccordion}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-3 text-left transition-all duration-300 ${disabled
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 active:bg-gray-100 transform hover:scale-[1.01]'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium transition-colors duration-200">
                        {label}
                    </span>
                    {selectedValues.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 transform transition-all duration-200 hover:scale-110 animate-pulse">
                            {selectedValues.length}
                        </span>
                    )}
                </div>
                <div className={`transition-all duration-300 transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </button>

            {/* Animated content container */}
            <div
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{ height: contentHeight }}
            >
                <div ref={contentRef} className={`border-t border-gray-200 ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                    {!disabled && (
                        <>
                            {/* Search and Controls */}
                            {options.length > 5 && (
                                <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 transform transition-all duration-300">
                                    <div className="relative transform transition-all duration-200 hover:scale-105">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
                                        />
                                    </div>
                                    {filteredOptions.length > 0 && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={selectAll}
                                                className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-all duration-200 transform hover:scale-105 hover:underline"
                                            >
                                                Tout sélectionner
                                            </button>
                                            <span className="text-gray-300 animate-pulse">|</span>
                                            <button
                                                onClick={clearAll}
                                                className="text-xs text-red-600 hover:text-red-800 font-medium transition-all duration-200 transform hover:scale-105 hover:underline"
                                            >
                                                Tout effacer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Options List */}
                            <div className="transform transition-all duration-300">
                                {filteredOptions.length > 0 ? (
                                    <div className="p-2">
                                        {filteredOptions.map((option, index) => {
                                            const isSelected = selectedValues.includes(option.value);
                                            return (
                                                <label
                                                    key={option.value}
                                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-200 group transform hover:scale-[1.02] ${isSelected
                                                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-150 shadow-sm'
                                                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                                                        } animate-fadeInUp`}
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                                                            className="sr-only"
                                                        />
                                                        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200 transform ${isSelected
                                                            ? 'bg-primary-600 border-primary-600 scale-110 shadow-md'
                                                            : 'border-gray-300 group-hover:border-gray-400 group-hover:scale-105'
                                                            }`}>
                                                            <Check className={`w-3 h-3 text-white transition-all duration-200 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                                                                }`} />
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-gray-700 flex-1 transition-colors duration-200 group-hover:text-gray-900">
                                                        {option.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center transform transition-all duration-300 hover:scale-105">
                                        <div className="text-gray-400 mb-1 transition-transform duration-200 hover:rotate-12">
                                            <Search className="w-8 h-8 mx-auto" />
                                        </div>
                                        <p className="text-sm text-gray-500 transition-colors duration-200">
                                            {searchTerm ? 'Aucun résultat trouvé' : placeholder}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Selection Summary */}
                            {selectedValues.length > 0 && (
                                <div className="px-3 py-2 bg-gradient-to-r from-primary-50 to-primary-100 border-t border-primary-200 transform transition-all duration-300 animate-slideInUp">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-primary-700 transition-colors duration-200">
                                            {selectedValues.length} élément{selectedValues.length > 1 ? 's' : ''} sélectionné{selectedValues.length > 1 ? 's' : ''}
                                        </span>
                                        <button
                                            onClick={clearAll}
                                            className="text-xs text-primary-600 hover:text-primary-800 font-medium transition-all duration-200 transform hover:scale-110 hover:underline"
                                        >
                                            Effacer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Custom animation styles */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.3s ease-out forwards;
                    opacity: 0;
                }
                
                .animate-slideInUp {
                    animation: slideInUp 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default AccordionCheckbox;