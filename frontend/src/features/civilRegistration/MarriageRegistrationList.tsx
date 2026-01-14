import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMarriageRegistrations, approveMarriage, rejectMarriage, createMarriage, updateMarriage, deleteMarriage } from "../../store/slices/civilSlice";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import CompactAreaSelector from "../../components/CompactAreaSelector";
import { Area } from "../../store/slices/areasSlice";
import CitizenAutocomplete from "./CitizenAutoComplete";

export interface MarriageInputForm {
  // Core marriage details
  husband: string;
  wife: string;
  husband_display: string;
  wife_display: string;

  marriage_type: string;
  date_of_marriage: string;
  place_of_marriage: string;

  officiant_name?: string;
  officiant_title?: string;
  certificate_number?: string;

  // System fields
  initiated_by: string;
  reference_number: string;
  status: any;
  approved_at?: string;
  area: string;

  // Husband details
  husband_nationality?: string;
  husband_previous_status?: string;
  husband_occupation?: string;
  husband_address?: string;

  husband_father_name?: string;
  husband_father_nationality?: string;
  husband_mother_name?: string;
  husband_mother_nationality?: string;

  // Wife details
  wife_nationality?: string;
  wife_previous_status?: string;
  wife_occupation?: string;
  wife_address?: string;

  wife_father_name?: string;
  wife_father_nationality?: string;
  wife_mother_name?: string;
  wife_mother_nationality?: string;
}


const MarriageRegistrationList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { marriage, loading, error } = useAppSelector((state) => state.civil);
  const { citizens } = useAppSelector((state) => state.citizens);

  const [newMarriage, setNewMarriage] = useState<MarriageInputForm>({
    husband: "",
    wife: "",
    husband_display: "",
    wife_display: "",

    marriage_type: "",
    date_of_marriage: "",
    place_of_marriage: "",

    officiant_name: "",
    officiant_title: "",
    certificate_number: "",

    initiated_by: "",
    reference_number: "",
    status: "submitted",
    approved_at: "",
    area: "",

    // Husband
    husband_nationality: "",
    husband_previous_status: "",
    husband_occupation: "",
    husband_address: "",
    husband_father_name: "",
    husband_father_nationality: "",
    husband_mother_name: "",
    husband_mother_nationality: "",

    // Wife
    wife_nationality: "",
    wife_previous_status: "",
    wife_occupation: "",
    wife_address: "",
    wife_father_name: "",
    wife_father_nationality: "",
    wife_mother_name: "",
    wife_mother_nationality: "",
  });


  const [editingMarriage, setEditingMarriage] = useState<MarriageInputForm | null>(null);
  const [spouse1Search, setSpouse1Search] = useState("");
  const [spouse2Search, setSpouse2Search] = useState("");
  const [editSpouse1Search, setEditSpouse1Search] = useState("");
  const [editSpouse2Search, setEditSpouse2Search] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  // const totalPages = Math.ceil(total / pageSize);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showSpouse1Parents, setShowSpouse1Parents] = useState(false);
  const [showSpouse2Parents, setShowSpouse2Parents] = useState(false);
  const [showWitnesses, setShowWitnesses] = useState(false);
  const [witnesses, setWitnesses] = useState([
    { name: '', id_number: '', phone: '', relationship: '' }
  ]);

  useEffect(() => {
    dispatch(fetchMarriageRegistrations());
  }, [dispatch]);

  const handleCreate = () => {
    dispatch(createMarriage(newMarriage));
    setNewMarriage({
      husband: "",
      wife: "",
      husband_display: "",
      wife_display: "",

      marriage_type: "",
      date_of_marriage: "",
      place_of_marriage: "",

      officiant_name: "",
      officiant_title: "",
      certificate_number: "",

      initiated_by: "",
      reference_number: "",
      status: "submitted",
      approved_at: "",
      area: "",

      // Husband
      husband_nationality: "",
      husband_previous_status: "",
      husband_occupation: "",
      husband_address: "",
      husband_father_name: "",
      husband_father_nationality: "",
      husband_mother_name: "",
      husband_mother_nationality: "",

      // Wife
      wife_nationality: "",
      wife_previous_status: "",
      wife_occupation: "",
      wife_address: "",
      wife_father_name: "",
      wife_father_nationality: "",
      wife_mother_name: "",
      wife_mother_nationality: "",
    });
    setSpouse1Search("");
    setSpouse2Search("");
  };

  const handleUpdate = () => {
    if (!editingMarriage) return;
    dispatch(updateMarriage(editingMarriage));
    setEditingMarriage(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this record?")) {
      dispatch(deleteMarriage(id));
    }
  };


  const handleAddWitness = () => {
    if (!showWitnesses) {
      setShowWitnesses(true);
    }
    setWitnesses([...witnesses, { name: '', id_number: '', phone: '', relationship: '' }]);
  };

  const handleRemoveWitness = (index) => {
    if (witnesses.length > 1) {
      setWitnesses(witnesses.filter((_, i) => i !== index));
    }
  };

  const handleWitnessChange = (index, field, value) => {
    const updatedWitnesses = witnesses.map((witness, i) =>
      i === index ? { ...witness, [field]: value } : witness
    );
    setWitnesses(updatedWitnesses);
  };

  const handleAreaSelectionChange = (areaId: string | null, area: Area | null) => {
    setSelectedAreaId(areaId);
    setNewMarriage({ ...newMarriage, area: areaId })
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = marriage.filter((m) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        // m.spouse1.toLowerCase().includes(searchLower) ||
        // m.spouse2.toLowerCase().includes(searchLower) ||
        m.place_of_marriage.toLowerCase().includes(searchLower) ||
        m.date_of_marriage.toLowerCase().includes(searchLower) ||
        m.status.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'reported_by') {
          aVal = `${a.reported_by?.first_name || ''} ${a.reported_by?.last_name || ''}`;
          bVal = `${b.reported_by?.first_name || ''} ${b.reported_by?.last_name || ''}`;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle nested properties
        if (sortConfig.key === 'reported_by') {
          aVal = `${a.reported_by?.first_name || ''} ${a.reported_by?.last_name || ''}`;
          bVal = `${b.reported_by?.first_name || ''} ${b.reported_by?.last_name || ''}`;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [marriage, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.direction === 'asc' ?
      <FaChevronUp className="ml-1 inline h-4 w-4" /> :
      <FaChevronDown className="ml-1 inline h-4 w-4" />;
  };

  if (loading) return <p>Loading Marriage Registrations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Marriage Registrations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage marriage registration records submitted by citizens.
        </p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-medium text-gray-900">Register Marriage</h2>

        {/* Marriage Details Section */}
        <div className="mb-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Marriage Details
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Marriage Type <span className="text-red-500">*</span>
              </label>
              <select
                value={newMarriage?.marriage_type || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, marriage_type: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type...</option>
                <option value="civil">Civil Marriage</option>
                <option value="religious">Religious Marriage</option>
                <option value="customary">Customary Marriage</option>
                <option value="islamic">Islamic Marriage</option>
                <option value="hindu">Hindu Marriage</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date of Marriage <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newMarriage.date_of_marriage}
                onChange={(e) => setNewMarriage({ ...newMarriage, date_of_marriage: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Place/Venue of Marriage <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newMarriage.place_of_marriage}
                onChange={(e) => setNewMarriage({ ...newMarriage, place_of_marriage: e.target.value })}
                placeholder="Church, Court, Venue..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Officiant Name
              </label>
              <input
                type="text"
                value={newMarriage?.officiant_name || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, officiant_name: e.target.value })}
                placeholder="Name of officiant"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Officiant Title/Role
              </label>
              <input
                type="text"
                value={newMarriage.officiant_title || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, officiant_title: e.target.value })}
                placeholder="Pastor, Judge, Registrar..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Marriage Certificate Number
              </label>
              <input
                type="text"
                value={newMarriage.certificate_number || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, certificate_number: e.target.value })}
                placeholder="Certificate number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Spouse 1 (Husband) Section */}
        <div className="mb-6 border-t border-gray-200 pt-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Spouse 1 (Husband) Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CitizenAutocomplete
                label="Husband"
                placeholder="Search by name or ID number"
                value={newMarriage.husband_display}
                onSelect={(id, display) => setNewMarriage({ ...newMarriage, husband: id, husband_display: display })}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nationality <span className="text-red-500">*</span>
              </label>
              <select
                value={newMarriage.husband_nationality || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, husband_nationality: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="kenyan">Kenyan</option>
                <option value="ugandan">Ugandan</option>
                <option value="tanzanian">Tanzanian</option>
                <option value="rwandan">Rwandan</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Marital Status Before Marriage <span className="text-red-500">*</span>
              </label>
              <select
                value={newMarriage.husband_previous_status || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, husband_previous_status: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="bachelor">Bachelor</option>
                <option value="divorced">Divorced</option>
                <option value="widower">Widower</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Occupation
              </label>
              <input
                type="text"
                value={newMarriage.husband_occupation || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, husband_occupation: e.target.value })}
                placeholder="Occupation"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Residence Address
              </label>
              <input
                type="text"
                value={newMarriage.husband_address || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, husband_address: e.target.value })}
                placeholder="Current address"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Spouse 1 Parents */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div
              onClick={() => setShowSpouse1Parents(!showSpouse1Parents)}
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Parent/Guardian Details (Optional)</span>
              </div>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showSpouse1Parents ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {showSpouse1Parents && (
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Father's Full Name
                  </label>
                  <input
                    type="text"
                    value={newMarriage.husband_father_name || ''}
                    onChange={(e) => setNewMarriage({ ...newMarriage, husband_father_name: e.target.value })}
                    placeholder="Father's name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Father's Nationality
                  </label>
                  <input
                    type="text"
                    value={newMarriage.husband_father_nationality || ''}
                    onChange={(e) => setNewMarriage({ ...newMarriage, husband_father_nationality: e.target.value })}
                    placeholder="Nationality"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mother's Full Name
                  </label>
                  <input
                    type="text"
                    value={newMarriage.husband_mother_name || ''}
                    onChange={(e) => setNewMarriage({ ...newMarriage, husband_mother_name: e.target.value })}
                    placeholder="Mother's name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mother's Nationality
                  </label>
                  <input
                    type="text"
                    value={newMarriage.husband_mother_nationality || ''}
                    onChange={(e) => setNewMarriage({ ...newMarriage, husband_mother_nationality: e.target.value })}
                    placeholder="Nationality"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Spouse 2 (Wife) Section */}
        <div className="mb-6 border-t border-gray-200 pt-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Spouse 2 (Wife) Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CitizenAutocomplete
                label="Wife"
                placeholder="Search by name or ID number"
                value={newMarriage.wife_display}
                onSelect={(id, display) => setNewMarriage({ ...newMarriage, wife: id, wife_display: display })}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nationality <span className="text-red-500">*</span>
              </label>
              <select
                value={newMarriage.wife_nationality || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, wife_nationality: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="kenyan">Kenyan</option>
                <option value="ugandan">Ugandan</option>
                <option value="tanzanian">Tanzanian</option>
                <option value="rwandan">Rwandan</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Marital Status Before Marriage <span className="text-red-500">*</span>
              </label>
              <select
                value={newMarriage.wife_previous_status || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, wife_previous_status: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                <option value="spinster">Spinster</option>
                <option value="divorced">Divorced</option>
                <option value="widow">Widow</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Occupation
              </label>
              <input
                type="text"
                value={newMarriage.wife_occupation || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, wife_occupation: e.target.value })}
                placeholder="Occupation"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Residence Address
              </label>
              <input
                type="text"
                value={newMarriage.wife_address || ''}
                onChange={(e) => setNewMarriage({ ...newMarriage, wife_address: e.target.value })}
                placeholder="Current address"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Spouse 2 Parents */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div
              onClick={() => setShowSpouse2Parents(!showSpouse2Parents)}
              className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Parent/Guardian Details (Optional)</span>
              </div>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showSpouse2Parents ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {showSpouse2Parents && (
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Father's Full Name
                  </label>
                  <input
                    type="text"
                    value={newMarriage.wife_father_name || ''}
                    onChange={(e) => setNewMarriage({ ...newMarriage, wife_father_name: e.target.value })}
                    placeholder="Father's name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Father's Nationality
                  </label>
                  <input
                    type="text"
                    value={newMarriage.wife_father_nationality || ''}
                    onChange={(e) => setNewMarriage({ ...newMarriage, wife_father_nationality: e.target.value })}
                    placeholder="Nationality"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mother's Full Name
                  </label>
                  <input
                    type="text"
                    value={newMarriage.wife_mother_name || ''}
                    onChange={(e) => setNewMarriage({ ...newMarriage, wife_mother_name: e.target.value })}
                    placeholder="Mother's name"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mother's Nationality
                  </label>
                  <input
                    type="text"
                    value={newMarriage.wife_mother_nationality || ''}
                    onChange={(e) => setNewMarriage({ ...newMarriage, wife_mother_nationality: e.target.value })}
                    placeholder="Nationality"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Witnesses Section */}
        <div className="mb-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
            <div
              onClick={() => setShowWitnesses(!showWitnesses)}
              className="flex items-center gap-3 flex-1 cursor-pointer"
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${showWitnesses ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900">
                  Witnesses
                </h3>
                <p className="text-xs text-gray-500">
                  Add witness information (minimum 2 required)
                  {witnesses.length > 0 && witnesses.some(w => w.name || w.id_number) &&
                    ` (${witnesses.filter(w => w.name || w.id_number).length} added)`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showWitnesses && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddWitness();
                  }}
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  + Add Witness
                </button>
              )}
              {showWitnesses && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Active
                </span>
              )}
              <svg
                onClick={() => setShowWitnesses(!showWitnesses)}
                className={`h-5 w-5 text-gray-400 transition-transform cursor-pointer ${showWitnesses ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {showWitnesses && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
              {witnesses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-3">No witnesses added yet (minimum 2 required)</p>
                  <button
                    type="button"
                    onClick={handleAddWitness}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    + Add First Witness
                  </button>
                </div>
              ) : (
                <>
                  {witnesses.map((witness, index) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          Witness {index + 1}
                        </span>
                        {witnesses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWitness(index)}
                            className="text-xs text-red-600 hover:text-red-800 focus:outline-none font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={witness.name}
                            onChange={(e) => handleWitnessChange(index, 'name', e.target.value)}
                            placeholder="Witness's full name"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            ID/Passport Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={witness.id_number}
                            onChange={(e) => handleWitnessChange(index, 'id_number', e.target.value)}
                            placeholder="ID or passport"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={witness.phone}
                            onChange={(e) => handleWitnessChange(index, 'phone', e.target.value)}
                            placeholder="+254..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Relationship to Couple
                          </label>
                          <input
                            type="text"
                            value={witness.relationship}
                            onChange={(e) => handleWitnessChange(index, 'relationship', e.target.value)}
                            placeholder="Friend, Family..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                             focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {index < witnesses.length - 1 && (
                        <div className="mt-4 border-b border-gray-200"></div>
                      )}
                    </div>
                  ))}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleAddWitness}
                      className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                    >
                      + Add Another Witness
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

         <CompactAreaSelector
          onSelectionChange={handleAreaSelectionChange}
          className="max-w-1xl mt-2"
        />

        <div className="mt-6">
          <button
            onClick={handleCreate}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium
                         text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            Submit Marriage Record
          </button>
        </div>
      </div>

      {/* Marriage Records Table */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search death records..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th
                    onClick={() => handleSort('reference')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Reference <SortIcon columnKey="reference" />
                  </th>
                  <th
                    onClick={() => handleSort('spouse1')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Spouse 1 <SortIcon columnKey="spouse1" />
                  </th>
                  <th
                    onClick={() => handleSort('spouse2')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Spouse 2 <SortIcon columnKey="spouse2" />
                  </th>
                  <th
                    onClick={() => handleSort('place_of_marriage')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Place of Marriage <SortIcon columnKey="place_of_marriage" />
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Status <SortIcon columnKey="status" />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedData.length > 0 ? (
                  paginatedData.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{m.reference_number}</td>
                      <td className="px-4 py-3">{m.spouse1}</td>
                      <td className="px-4 py-3">{m.spouse2}</td>
                      <td className="px-4 py-3">{m.place_of_marriage}</td>
                      <td className="px-4 py-3">{m.status}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => dispatch(approveMarriage(m.id))}
                          className={`px-3 py-1 text-sm rounded cursor-pointer ${m.status !== "approved"
                            ? "text-green-700 bg-green-100 hover:bg-green-200"
                            : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => dispatch(rejectMarriage(m.id))}
                          className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setEditingMarriage(m)}
                          className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No incidents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} of{' '}
            {filteredAndSortedData.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-md px-3 py-1 text-sm font-medium ${currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingMarriage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Edit Marriage Record</h3>

            {/* Spouse 1 & 2 Searchable Selects */}
            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Spouse 1</label>
              <input
                type="text"
                placeholder="Search Spouse 1..."
                value={editSpouse1Search}
                onChange={(e) => setEditSpouse1Search(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingMarriage.husband}
                onChange={(e) =>
                  setEditingMarriage({ ...editingMarriage, husband: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Spouse 1</option>
                {citizens
                  .filter((c) => c.name.toLowerCase().includes(editSpouse1Search.toLowerCase()))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.national_id})
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-gray-700">Spouse 2</label>
              <input
                type="text"
                placeholder="Search Spouse 2..."
                value={editSpouse2Search}
                onChange={(e) => setEditSpouse2Search(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-2
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingMarriage.wife}
                onChange={(e) =>
                  setEditingMarriage({ ...editingMarriage, wife: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Spouse 2</option>
                {citizens
                  .filter((c) => c.name.toLowerCase().includes(editSpouse2Search.toLowerCase()))
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.national_id})
                    </option>
                  ))}
              </select>
            </div>

            {/* Other Fields */}
            {["date_of_marriage", "place_of_marriage", "initiated_by", "reference_number", "status", "approved_at"].map(
              (field) => (
                <div className="mb-3" key={field}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {field.replace("_", " ").toUpperCase()}
                  </label>
                  {field === "status" ? (
                    <select
                      value={(editingMarriage as any)[field]}
                      onChange={(e) =>
                        setEditingMarriage({ ...editingMarriage, [field]: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <input
                      type={field.includes("date") || field.includes("approved") ? "datetime-local" : "text"}
                      value={(editingMarriage as any)[field] || ""}
                      onChange={(e) =>
                        setEditingMarriage({ ...editingMarriage, [field]: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              )
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingMarriage(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarriageRegistrationList;
