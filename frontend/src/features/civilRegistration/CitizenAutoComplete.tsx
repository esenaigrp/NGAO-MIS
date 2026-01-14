import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Citizen, lookupCitizens } from '../../store/slices/citizenSlice';


interface CitizenAutocompleteProps {
    label: string;
    placeholder: string;
    value: string;
    onSelect: (citizenId: string, displayName: string) => void;
    onManualEntry?: (manualData: ManualCitizenData) => void;
    required?: boolean;
}

export interface ManualCitizenData {
    first_name: string;
    middle_name: string;
    last_name: string;
    id_number: string;
    gender: string;
    date_of_birth: string;
}

const CitizenAutocomplete: React.FC<CitizenAutocompleteProps> = ({
    label,
    placeholder,
    value,
    onSelect,
    onManualEntry,
    required = false
}) => {
    const dispatch = useAppDispatch();
    const { citizens, loading } = useAppSelector((state) => state.citizens);
    const [searchTerm, setSearchTerm] = useState(value);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [selectedCitizenId, setSelectedCitizenId] = useState('');
    const [manualData, setManualData] = useState<ManualCitizenData>({
        first_name: '',
        middle_name: '',
        last_name: '',
        id_number: '',
        date_of_birth: '',
        gender: ''
    });
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
        if (searchTerm.length >= 2 && !showManualEntry) {
            const timer = setTimeout(() => {
                dispatch(lookupCitizens({ query: searchTerm }));
                console.log('Searching for:', searchTerm);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, showManualEntry]);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        setShowDropdown(true);
        setSelectedCitizenId('');

        if (newValue !== value) {
            onSelect('', newValue);
        }
    };

    const handleSelectCitizen = (citizen: Citizen) => {
        const displayName = `${citizen.first_name} ${citizen.middle_name || ''} ${citizen.last_name}`.trim();
        setSearchTerm(displayName);
        setSelectedCitizenId(citizen.id);
        setShowDropdown(false);
        setShowManualEntry(false);
        onSelect(citizen.id, displayName);
    };

    const toggleManualEntry = () => {
        setShowManualEntry(!showManualEntry);
        setShowDropdown(false);
        if (!showManualEntry) {
            // Switching to manual entry mode
            setSearchTerm('');
            setSelectedCitizenId('');
            onSelect('', '');
        } else {
            // Switching back to search mode
            setManualData({
                first_name: '',
                middle_name: '',
                last_name: '',
                id_number: '',
                gender: '',
                date_of_birth: ''
            });
        }
    };

    const handleManualFieldChange = (field: keyof ManualCitizenData, value: string) => {
        const updated = { ...manualData, [field]: value };
        setManualData(updated);
        if (onManualEntry) {
            onManualEntry(updated);
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {!showManualEntry ? (
                <>
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

                    <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                            Type at least 2 characters to search by name or ID number
                        </p>
                        <button
                            type="button"
                            onClick={toggleManualEntry}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Not found? Enter manually
                        </button>
                    </div>
                </>
            ) : (
                <div className="space-y-2 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-blue-900">Manual Entry Mode</span>
                        <button
                            type="button"
                            onClick={toggleManualEntry}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            ← Back to search
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={manualData.first_name}
                            onChange={(e) => handleManualFieldChange('first_name', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Middle Name
                        </label>
                        <input
                            type="text"
                            placeholder="Middle Name (optional)"
                            value={manualData.middle_name}
                            onChange={(e) => handleManualFieldChange('middle_name', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={manualData.last_name}
                            onChange={(e) => handleManualFieldChange('last_name', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={manualData.date_of_birth}
                            onChange={(e) => handleManualFieldChange('date_of_birth', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Gender
                        </label>
                        <select
                            value={manualData.gender}
                            onChange={(e) => handleManualFieldChange('gender', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            ID Number <span className="text-red-500"></span>
                        </label>
                        <input
                            type="text"
                            placeholder="ID Number"
                            value={manualData.id_number}
                            onChange={(e) => handleManualFieldChange('id_number', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};


export default CitizenAutocomplete
