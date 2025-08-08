import { ChevronDown } from "lucide-react";

const CustomSelect = ({ value, onChange, options, placeholder, disabled = false }) => (
    <div className="relative">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:ring-2 focus:ring-primary-500 outline-none focus:border-transparent appearance-none ${disabled
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
);

export default CustomSelect