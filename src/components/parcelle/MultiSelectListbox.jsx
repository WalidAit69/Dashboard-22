import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";


const MultiSelectListbox = ({ 
    label, 
    options = [], 
    selectedValues = [], 
    onChange, 
    disabled = false,
    placeholder = "Sélectionner..."
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (value) => {
        const newSelected = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onChange(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedValues.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map(option => option.value));
        }
    };

    const displayText = selectedValues.length === 0 
        ? placeholder 
        : selectedValues.length === 1 
            ? options.find(opt => opt.value === selectedValues[0])?.label || selectedValues[0]
            : `${selectedValues.length} sélectionné(s)`;

    return (
        <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-left bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                    <span className="block truncate">{displayText}</span>
                </button>
                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.length > 1 && (
                        <div className="px-3 py-2 border-b border-gray-100">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                {selectedValues.length === options.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                            </button>
                        </div>
                    )}
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleToggle(option.value)}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                        >
                            <span className="text-sm text-gray-900">{option.label}</span>
                            {selectedValues.includes(option.value) && (
                                <Check className="w-4 h-4 text-blue-600" />
                            )}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                            Aucune option disponible
                        </div>
                    )}
                </div>
            )}

            {/* Backdrop to close dropdown */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default MultiSelectListbox