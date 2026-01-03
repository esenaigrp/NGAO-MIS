import React, { useEffect, useMemo, useState } from "react";

import { FaSearch, FaChevronUp, FaChevronDown, FaUser, FaIdCard, FaMapMarkerAlt} from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for the trend chart
const trendData = [
  { month: 'Jan', count: 45 },
  { month: 'Feb', count: 52 },
  { month: 'Mar', count: 61 },
  { month: 'Apr', count: 58 },
  { month: 'May', count: 70 },
  { month: 'Jun', count: 68 }
];

const NationalIdRegistration: React.FC = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    surname: "", other_names: "", maiden_name: "", date_of_birth: "",
    place_of_birth: "", gender: "", marital_status: "", occupation: "",
    phone_number: "", email: "", postal_address: "", postal_code: "",
    county: "", sub_county: "", ward: "", location: "", sub_location: "", village: "",
    mother_surname: "", mother_other_names: "", mother_id_number: "", mother_nationality: "Kenyan",
    father_surname: "", father_other_names: "", father_id_number: "", father_nationality: "Kenyan",
    birth_certificate_number: "", previous_id_number: "", disability: "", disability_details: ""
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: string }>({ 
    key: null, direction: 'asc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState('applicant');

  useEffect(() => {
    const mockData = [
      {
        id: '1', reference_number: 'NID-2026-001', surname: 'WANJIRU',
        other_names: 'JANE MUTHONI', date_of_birth: '1998-05-15',
        phone_number: '+254712345678', county: 'Nairobi', status: 'pending',
        submitted_date: '2026-01-02'
      },
      {
        id: '2', reference_number: 'NID-2026-002', surname: 'OMONDI',
        other_names: 'PETER OTIENO', date_of_birth: '2000-08-22',
        phone_number: '+254723456789', county: 'Kisumu', status: 'approved',
        submitted_date: '2025-12-28'
      }
    ];
    setRegistrations(mockData);
  }, []);

  const handleCreate = () => {
    const newRegistration = {
      id: Date.now().toString(),
      reference_number: `NID-2026-${String(registrations.length + 1).padStart(3, '0')}`,
      ...form, status: 'draft',
      submitted_date: new Date().toISOString().split('T')[0]
    };
    setRegistrations([...registrations, newRegistration]);
    setForm({
      surname: "", other_names: "", maiden_name: "", date_of_birth: "",
      place_of_birth: "", gender: "", marital_status: "", occupation: "",
      phone_number: "", email: "", postal_address: "", postal_code: "",
      county: "", sub_county: "", ward: "", location: "", sub_location: "", village: "",
      mother_surname: "", mother_other_names: "", mother_id_number: "", mother_nationality: "Kenyan",
      father_surname: "", father_other_names: "", father_id_number: "", father_nationality: "Kenyan",
      birth_certificate_number: "", previous_id_number: "", disability: "", disability_details: ""
    });
    setActiveTab('applicant');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      setRegistrations(registrations.filter(r => r.id !== id));
    }
  };

  const handleSubmit = (id: string) => {
    if (window.confirm('Submit this registration for approval?')) {
      setRegistrations(registrations.map(r => 
        r.id === id ? { ...r, status: 'pending' } : r
      ));
    }
  };

  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = registrations.filter((r) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        r.surname?.toLowerCase().includes(searchLower) ||
        r.other_names?.toLowerCase().includes(searchLower) ||
        r.reference_number?.toLowerCase().includes(searchLower) ||
        r.phone_number?.toLowerCase().includes(searchLower) ||
        r.county?.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key as keyof typeof a];
        let bVal = b[sortConfig.key as keyof typeof b];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [registrations, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <span className="ml-1 text-gray-400">⇅</span>;
    return sortConfig.direction === 'asc' ?
      <FaChevronUp className="ml-1 inline h-4 w-4" /> :
      <FaChevronDown className="ml-1 inline h-4 w-4" />;
  };

  const kenyanCounties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Kakamega", "Nyeri",
    "Machakos", "Meru", "Kisii", "Kiambu", "Kajiado", "Nandi", "Laikipia"
  ];

  if (loading) return <p>Loading National ID Registrations...</p>;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">National ID Registration</h1>
          <p className="mt-1 text-sm text-gray-600">Register citizens for Kenyan National Identification Cards</p>
        </div>
        <FaIdCard className="text-6xl text-blue-600 opacity-20" />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{registrations.length}</p>
            </div>
            <FaUser className="text-3xl text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {registrations.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <FaIdCard className="text-3xl text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {registrations.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <FaIdCard className="text-3xl text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {registrations.filter(r => r.status === 'draft').length}
              </p>
            </div>
            <FaIdCard className="text-3xl text-gray-400" />
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} name="Registrations" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Registration Form */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FaIdCard /> New National ID Application
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab('applicant')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'applicant'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            Applicant Details
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'contact'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            Contact & Address
          </button>
          <button
            onClick={() => setActiveTab('parents')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'parents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            Parents' Details
          </button>
          <button
            onClick={() => setActiveTab('additional')}
            className={`py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'additional'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            Additional Info
          </button>
        </div>

        <div className="p-6">
          {/* Applicant Details Tab */}
          {activeTab === 'applicant' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Surname <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="As per birth certificate"
                  value={form.surname}
                  onChange={(e) => setForm({ ...form, surname: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Other Names <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="First and middle names"
                  value={form.other_names}
                  onChange={(e) => setForm({ ...form, other_names: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Maiden Name <span className="text-gray-400">(if applicable)</span>
                </label>
                <input
                  placeholder="Previous surname"
                  value={form.maiden_name}
                  onChange={(e) => setForm({ ...form, maiden_name: e.target.value.toUpperCase() })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Place of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="District/Hospital"
                  value={form.place_of_birth}
                  onChange={(e) => setForm({ ...form, place_of_birth: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.marital_status}
                  onChange={(e) => setForm({ ...form, marital_status: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Occupation <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Current occupation"
                  value={form.occupation}
                  onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Contact & Address Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      placeholder="+254712345678"
                      value={form.phone_number}
                      onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Father's Nationality <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.father_nationality}
                      onChange={(e) => setForm({ ...form, father_nationality: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information Tab */}
          {activeTab === 'additional' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Birth Certificate Number <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Birth certificate number"
                  value={form.birth_certificate_number}
                  onChange={(e) => setForm({ ...form, birth_certificate_number: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Previous ID Number <span className="text-gray-400">(if replacing)</span>
                </label>
                <input
                  placeholder="Previous ID number"
                  value={form.previous_id_number}
                  onChange={(e) => setForm({ ...form, previous_id_number: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Any Disability?
                </label>
                <select
                  value={form.disability}
                  onChange={(e) => setForm({ ...form, disability: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  <option value="None">None</option>
                  <option value="Visual">Visual Impairment</option>
                  <option value="Hearing">Hearing Impairment</option>
                  <option value="Physical">Physical Disability</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Disability Details <span className="text-gray-400">(if applicable)</span>
                </label>
                <textarea
                  placeholder="Provide details about disability"
                  value={form.disability_details}
                  onChange={(e) => setForm({ ...form, disability_details: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between border-t pt-4">
            <div className="flex gap-2">
              {activeTab !== 'applicant' && (
                <button
                  onClick={() => {
                    const tabs = ['applicant', 'contact', 'parents', 'additional'];
                    const currentIndex = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIndex - 1]);
                  }}
                  className="inline-flex items-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Previous
                </button>
              )}
              {activeTab !== 'additional' && (
                <button
                  onClick={() => {
                    const tabs = ['applicant', 'contact', 'parents', 'additional'];
                    const currentIndex = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIndex + 1]);
                  }}
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
            <button
              onClick={handleCreate}
              disabled={!form.surname || !form.other_names || !form.date_of_birth || !form.phone_number}
              className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save Application
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Registration Records</h2>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search registrations..."
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
                    onClick={() => handleSort('reference_number')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Reference <SortIcon columnKey="reference_number" />
                  </th>
                  <th
                    onClick={() => handleSort('surname')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Name <SortIcon columnKey="surname" />
                  </th>
                  <th
                    onClick={() => handleSort('date_of_birth')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Date of Birth <SortIcon columnKey="date_of_birth" />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Phone</th>
                  <th
                    onClick={() => handleSort('county')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    County <SortIcon columnKey="county" />
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
                  paginatedData.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.reference_number}</td>
                      <td className="px-4 py-3">{r.surname} {r.other_names}</td>
                      <td className="px-4 py-3">{r.date_of_birth}</td>
                      <td className="px-4 py-3">{r.phone_number}</td>
                      <td className="px-4 py-3">{r.county}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === 'draft' 
                            ? 'bg-gray-100 text-gray-800' 
                            : r.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleSubmit(r.id)}
                          disabled={r.status !== "draft"}
                          className={`px-3 py-1 text-sm rounded ${r.status === "draft"
                            ? "text-green-700 bg-green-100 hover:bg-green-200"
                            : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                          Submit
                        </button>

                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={r.status !== "draft"}
                          className={`px-3 py-1 text-sm rounded ${r.status === "draft"
                            ? "text-red-700 bg-red-100 hover:bg-red-200"
                            : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No registration records found
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
    </div>
  );
};

export default NationalIdRegistration;