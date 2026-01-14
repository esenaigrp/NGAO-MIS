import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaChevronUp, FaChevronDown, FaTimes, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import CompactAreaSelector from '../../components/CompactAreaSelector';

interface OfficerMock {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  officers: OfficerMock[];
  location: string;
  area_id: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  created_at: string;
}

const Projects = () => {
  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    selected_officers: [] as OfficerMock[],
    location: '',
    area_id: '',
    status: 'planning' as Project['status']
  });

  // Officer selection state
  const [officerSearch, setOfficerSearch] = useState('');
  const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);
  const [officers, setOfficers] = useState<OfficerMock[]>([]);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: string }>({
    key: 'created_at',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch officers (simulated)
  useEffect(() => {
    const dummyOfficers: OfficerMock[] = [
      { id: '1', first_name: 'Sarah', last_name: 'Johnson', phone: '+1234567891', department: 'Civil Registry' },
      { id: '2', first_name: 'Michael', last_name: 'Brown', phone: '+1234567892', department: 'Health Services' },
      { id: '3', first_name: 'Emily', last_name: 'Davis', phone: '+1234567893', department: 'Civil Registry' },
      { id: '4', first_name: 'James', last_name: 'Wilson', phone: '+1234567894', department: 'Administration' },
      { id: '5', first_name: 'Linda', last_name: 'Martinez', phone: '+1234567895', department: 'Engineering' },
      { id: '6', first_name: 'Robert', last_name: 'Garcia', phone: '+1234567896', department: 'Health Services' },
      { id: '7', first_name: 'Patricia', last_name: 'Rodriguez', phone: '+1234567897', department: 'Engineering' },
      { id: '8', first_name: 'David', last_name: 'Lee', phone: '+1234567898', department: 'Administration' },
    ];
    setOfficers(dummyOfficers);

    // Dummy projects
    const dummyProjects: Project[] = [
      {
        id: '1',
        title: 'Digital Birth Registry System',
        description: 'Implementation of a digital system for birth registration across all regional offices.',
        budget: 500000,
        officers: [dummyOfficers[0], dummyOfficers[2]],
        location: 'Nairobi Central',
        area_id: '1',
        status: 'in-progress',
        created_at: '2024-01-05'
      },
      {
        id: '2',
        title: 'Community Health Outreach Program',
        description: 'Mobile health clinics providing vaccinations and health screenings in rural areas.',
        budget: 750000,
        officers: [dummyOfficers[1], dummyOfficers[5]],
        location: 'Westlands',
        area_id: '2',
        status: 'in-progress',
        created_at: '2024-01-03'
      },
      {
        id: '3',
        title: 'Road Infrastructure Upgrade',
        description: 'Rehabilitation and expansion of main roads in the district.',
        budget: 2000000,
        officers: [dummyOfficers[4], dummyOfficers[6]],
        location: 'Eastleigh',
        area_id: '3',
        status: 'planning',
        created_at: '2024-01-01'
      },
      {
        id: '4',
        title: 'Civil Registry Training Program',
        description: 'Training sessions for staff on new registration procedures and systems.',
        budget: 150000,
        officers: [dummyOfficers[0], dummyOfficers[3]],
        location: 'Karen',
        area_id: '4',
        status: 'completed',
        created_at: '2023-12-15'
      },
    ];
    setProjects(dummyProjects);
  }, []);

  // Filter officers based on search and exclude already selected
  const filteredOfficers = useMemo(() => {
    const selectedIds = form.selected_officers.map(o => o.id);
    let available = officers.filter(o => !selectedIds.includes(o.id));
    
    if (!officerSearch) return available;
    
    const searchLower = officerSearch.toLowerCase();
    return available.filter(officer =>
      officer.first_name.toLowerCase().includes(searchLower) ||
      officer.last_name.toLowerCase().includes(searchLower) ||
      officer.department.toLowerCase().includes(searchLower)
    );
  }, [officers, officerSearch, form.selected_officers]);

  // Handle officer selection (add to list)
  const handleOfficerSelect = (officer: OfficerMock) => {
    setForm({
      ...form,
      selected_officers: [...form.selected_officers, officer]
    });
    setOfficerSearch('');
    setShowOfficerDropdown(false);
  };

  // Remove officer from selection
  const removeOfficer = (officerId: string) => {
    setForm({
      ...form,
      selected_officers: form.selected_officers.filter(o => o.id !== officerId)
    });
  };

  // Handle area selection
  const handleAreaSelectionChange = (areaId: string) => {
    // Get area name from the select element
    const areaName = document.querySelector(`option[value="${areaId}"]`)?.textContent || '';
    setForm({
      ...form,
      area_id: areaId,
      location: areaName
    });
  };

  // Form validation
  const isFormValid = () => {
    return !!(
      form.title.trim() &&
      form.description.trim() &&
      form.budget &&
      parseFloat(form.budget) > 0 &&
      form.selected_officers.length > 0 &&
      form.area_id
    );
  };

  // Handle create/update project
  const handleSaveProject = () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields.');
      return;
    }

    const projectData: Project = {
      id: editingProject ? editingProject.id : String(projects.length + 1),
      title: form.title,
      description: form.description,
      budget: parseFloat(form.budget),
      officers: form.selected_officers,
      location: form.location,
      area_id: form.area_id,
      status: form.status,
      created_at: editingProject ? editingProject.created_at : new Date().toISOString().split('T')[0]
    };

    if (editingProject) {
      // Update existing project
      setProjects(projects.map(p => p.id === editingProject.id ? projectData : p));
      alert('Project updated successfully!');
    } else {
      // Create new project
      setProjects([projectData, ...projects]);
      alert('Project created successfully!');
    }

    // Reset form
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      budget: '',
      selected_officers: [],
      location: '',
      area_id: '',
      status: 'planning'
    });
    setEditingProject(null);
  };

  // Handle edit project
  const handleEditProject = (project: Project) => {
    setForm({
      title: project.title,
      description: project.description,
      budget: String(project.budget),
      selected_officers: project.officers,
      location: project.location,
      area_id: project.area_id,
      status: project.status
    });
    setEditingProject(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete project
  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== id));
      alert('Project deleted successfully!');
    }
  };

  // Table sorting and filtering
  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      const searchLower = searchTerm.toLowerCase();
      const officerNames = project.officers.map(o => `${o.first_name} ${o.last_name}`).join(' ').toLowerCase();
      return (
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.location.toLowerCase().includes(searchLower) ||
        project.status.toLowerCase().includes(searchLower) ||
        officerNames.includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof Project];
        let bVal: any = b[sortConfig.key as keyof Project];

        if (sortConfig.key === 'officers') {
          aVal = a.officers.length;
          bVal = b.officers.length;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [projects, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
  const paginatedProjects = filteredAndSortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.direction === 'asc' ?
      <FaChevronUp className="ml-1 inline h-4 w-4" /> :
      <FaChevronDown className="ml-1 inline h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Projects Management</h1>
        <p className="mt-1 text-sm text-gray-500">Create and manage projects with assigned officers and budgets.</p>
      </div>

      {/* Create/Edit Project Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </h2>
          {editingProject && (
            <button
              onClick={resetForm}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter project title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter project description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Budget */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Budget (KSh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter budget amount"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Project['status'] })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Officers in Charge (Multi-select) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Officers in Charge <span className="text-red-500">*</span>
            </label>
            
            {/* Selected Officers Display */}
            {form.selected_officers.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {form.selected_officers.map((officer) => (
                  <div
                    key={officer.id}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-sm text-blue-800"
                  >
                    <span>{officer.first_name} {officer.last_name}</span>
                    <span className="text-blue-600">({officer.department})</span>
                    <button
                      onClick={() => removeOfficer(officer.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Officer Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search officers by name or department..."
                value={officerSearch}
                onChange={(e) => {
                  setOfficerSearch(e.target.value);
                  setShowOfficerDropdown(true);
                }}
                onFocus={() => setShowOfficerDropdown(true)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />

              {/* Officer Dropdown */}
              {showOfficerDropdown && filteredOfficers.length > 0 && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {filteredOfficers.map((officer) => (
                    <div
                      key={officer.id}
                      onClick={() => handleOfficerSelect(officer)}
                      className="cursor-pointer px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {officer.first_name} {officer.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {officer.department} • {officer.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showOfficerDropdown && filteredOfficers.length === 0 && officerSearch && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg p-4 text-center text-sm text-gray-500">
                  No officers found
                </div>
              )}
            </div>
          </div>

          {/* Location Selector */}
          <CompactAreaSelector
            onSelectionChange={handleAreaSelectionChange}
            className="w-full"
          />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSaveProject}
              disabled={!isFormValid()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {editingProject ? (
                <>
                  <FaEdit className="h-4 w-4" />
                  Update Project
                </>
              ) : (
                <>
                  <FaPlus className="h-4 w-4" />
                  Create Project
                </>
              )}
            </button>
            {editingProject && (
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Table Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">All Projects</h2>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
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
                    onClick={() => handleSort('title')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Title <SortIcon columnKey="title" />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Description</th>
                  <th
                    onClick={() => handleSort('budget')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Budget <SortIcon columnKey="budget" />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Officers</th>
                  <th
                    onClick={() => handleSort('location')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Location <SortIcon columnKey="location" />
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
                {paginatedProjects.length > 0 ? (
                  paginatedProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{project.title}</td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs truncate" title={project.description}>
                          {project.description}
                        </div>
                      </td>
                      <td className="px-4 py-3">KSh {project.budget.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {project.officers.map((officer, index) => (
                            <span
                              key={officer.id}
                              className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                              title={`${officer.first_name} ${officer.last_name} - ${officer.department}`}
                            >
                              {officer.first_name} {officer.last_name.charAt(0)}.
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">{project.location}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : project.status === 'planning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="px-3 py-1 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No projects found
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
            Showing {paginatedProjects.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedProjects.length)} of{' '}
            {filteredAndSortedProjects.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
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

export default Projects;