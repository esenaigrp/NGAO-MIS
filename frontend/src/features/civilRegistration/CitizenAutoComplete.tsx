import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Citizen, lookupCitizens } from '../../store/slices/citizenSlice';


interface CitizenAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onSelect: (citizenId: string, displayName: string) => void;
  required?: boolean;
}

const CitizenAutocomplete: React.FC<CitizenAutocompleteProps> = ({
    label,
    placeholder,
    value,
    onSelect,
    required = false
}) => {
    const dispatch = useAppDispatch();
    const { citizens, loading } = useAppSelector((state) => state.citizens);

    const [searchTerm, setSearchTerm] = useState(value);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch citizens when search term changes
    useEffect(() => {
        if (searchTerm.length >= 2) {
            // Debounce the API call
            const timer = setTimeout(() => {
                // Pass the search term to the API - can be name or id_number
                dispatch(lookupCitizens({ query: searchTerm }));
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, dispatch]);

    console.log("citizens:", citizens);

    // Update searchTerm when value prop changes
    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setShowDropdown(true);
        setSelectedCitizenId('');

        // Clear selection if user modifies the text
        if (newValue !== value) {
            onSelect('', newValue);
        }
    };

    const handleSelectCitizen = (citizen: Citizen) => {
        const displayName = `${citizen.first_name} ${citizen.middle_name || ''} ${citizen.last_name}`.trim();
        setSearchTerm(displayName);
        setSelectedCitizenId(citizen.id);
        setShowDropdown(false);
        onSelect(citizen.id, displayName);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
            />

            {/* Loading indicator */}
            {loading && searchTerm.length >= 2 && (
                <div className="absolute right-3 top-9 text-gray-400">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {/* Dropdown */}
            {showDropdown && searchTerm.length >= 2 && !loading && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                    {citizens && citizens.length > 0 ? (
                        citizens.map((citizen: Citizen) => (
                            <div
                                key={citizen.id}
                                onClick={() => handleSelectCitizen(citizen)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                                <div className="font-medium text-gray-900">
                                    {citizen.first_name} {citizen.middle_name || ''} {citizen.last_name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex gap-3">
                                    <span>ID: {citizen.id_number}</span>
                                    <span>DOB: {citizen.date_of_birth}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No citizens found. Try a different search term.
                        </div>
                    )}
                </div>
            )}

            {/* Hint text */}
            <p className="mt-1 text-xs text-gray-500">
                Type at least 2 characters to search by name or ID number
            </p>
        </div>
    );
};


export default CitizenAutocomplete