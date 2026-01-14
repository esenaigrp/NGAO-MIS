import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaChevronUp, FaChevronDown, FaPaperPlane, FaInbox, FaTimes } from 'react-icons/fa';

interface OfficerMock {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
}

interface MessageMock {
  id: string;
  sender: string;
  recipient: string;
  recipient_phone: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'failed';
}

const Messaging = () => {
  // Dummy logged-in user
  const currentUser = {
    name: 'John Admin',
    phone: '+1234567890'
  };

  // State for form
  const [form, setForm] = useState({
    recipient_id: '',
    recipient_display: '',
    recipient_phone: '',
    content: ''
  });

  // State for recipient search
  const [recipientSearch, setRecipientSearch] = useState('');
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [officers, setOfficers] = useState<OfficerMock[]>([]);

  // State for message table
  const [messages, setMessages] = useState<MessageMock[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: string }>({
    key: 'timestamp',
    direction: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch officers (simulated)
  useEffect(() => {
    // Simulate fetching officers
    const dummyOfficers: OfficerMock[] = [
      { id: '1', first_name: 'Sarah', last_name: 'Johnson', phone: '+1234567891', department: 'Civil Registry' },
      { id: '2', first_name: 'Michael', last_name: 'Brown', phone: '+1234567892', department: 'Health Services' },
      { id: '3', first_name: 'Emily', last_name: 'Davis', phone: '+1234567893', department: 'Civil Registry' },
      { id: '4', first_name: 'James', last_name: 'Wilson', phone: '+1234567894', department: 'Administration' },
      { id: '5', first_name: 'Linda', last_name: 'Martinez', phone: '+1234567895', department: 'Civil Registry' },
      { id: '6', first_name: 'Robert', last_name: 'Garcia', phone: '+1234567896', department: 'Health Services' },
    ];
    setOfficers(dummyOfficers);

    // Dummy messages
    const dummyMessages: MessageMock[] = [
      {
        id: '1',
        sender: currentUser.name,
        recipient: 'Sarah Johnson',
        recipient_phone: '+1234567891',
        content: 'Please review the birth registration for reference #BR-2024-001.',
        timestamp: '2024-01-09 14:30:00',
        status: 'delivered'
      },
      {
        id: '2',
        sender: currentUser.name,
        recipient: 'Michael Brown',
        recipient_phone: '+1234567892',
        content: 'The vaccination schedule has been updated. Please check your portal.',
        timestamp: '2024-01-09 13:15:00',
        status: 'delivered'
      },
      {
        id: '3',
        sender: currentUser.name,
        recipient: 'Emily Davis',
        recipient_phone: '+1234567893',
        content: 'Reminder: Staff meeting tomorrow at 10 AM.',
        timestamp: '2024-01-09 11:45:00',
        status: 'sent'
      },
      {
        id: '4',
        sender: currentUser.name,
        recipient: 'James Wilson',
        recipient_phone: '+1234567894',
        content: 'Can you provide an update on the pending death certificate requests?',
        timestamp: '2024-01-08 16:20:00',
        status: 'delivered'
      },
      {
        id: '5',
        sender: currentUser.name,
        recipient: 'Linda Martinez',
        recipient_phone: '+1234567895',
        content: 'Please approve the marriage registration for couple ID #MR-2024-050.',
        timestamp: '2024-01-08 09:30:00',
        status: 'failed'
      },
    ];
    setMessages(dummyMessages);
  }, []);

  // Filter officers based on search
  const filteredOfficers = useMemo(() => {
    if (!recipientSearch) return officers;
    const searchLower = recipientSearch.toLowerCase();
    return officers.filter(officer =>
      officer.first_name.toLowerCase().includes(searchLower) ||
      officer.last_name.toLowerCase().includes(searchLower) ||
      officer.phone.includes(searchLower) ||
      officer.department.toLowerCase().includes(searchLower)
    );
  }, [officers, recipientSearch]);

  // Handle recipient selection
  const handleRecipientSelect = (officer: OfficerMock) => {
    setForm({
      ...form,
      recipient_id: officer.id,
      recipient_display: `${officer.first_name} ${officer.last_name}`,
      recipient_phone: officer.phone
    });
    setRecipientSearch(`${officer.first_name} ${officer.last_name}`);
    setShowRecipientDropdown(false);
  };

  // Handle recipient search input
  const handleRecipientSearchChange = (value: string) => {
    setRecipientSearch(value);
    setShowRecipientDropdown(true);
    // Clear selection if user is typing
    if (form.recipient_id) {
      setForm({
        ...form,
        recipient_id: '',
        recipient_display: '',
        recipient_phone: ''
      });
    }
  };

  // Clear recipient selection
  const clearRecipient = () => {
    setForm({
      ...form,
      recipient_id: '',
      recipient_display: '',
      recipient_phone: ''
    });
    setRecipientSearch('');
  };

  // Handle send message
  const handleSendMessage = () => {
    if (!form.recipient_id || !form.content.trim()) {
      alert('Please select a recipient and enter a message.');
      return;
    }

    const newMessage: MessageMock = {
      id: String(messages.length + 1),
      sender: currentUser.name,
      recipient: form.recipient_display,
      recipient_phone: form.recipient_phone,
      content: form.content,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'sent'
    };

    setMessages([newMessage, ...messages]);
    
    // Reset form
    setForm({
      recipient_id: '',
      recipient_display: '',
      recipient_phone: '',
      content: ''
    });
    setRecipientSearch('');

    alert('Message sent successfully!');
  };

  // Validation
  const isFormValid = () => {
    return form.recipient_id && form.content.trim().length > 0;
  };

  // Table sorting and filtering
  const handleSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedMessages = useMemo(() => {
    let filtered = messages.filter((msg) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        msg.recipient.toLowerCase().includes(searchLower) ||
        msg.recipient_phone.includes(searchLower) ||
        msg.content.toLowerCase().includes(searchLower) ||
        msg.status.toLowerCase().includes(searchLower)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof MessageMock];
        const bVal = b[sortConfig.key as keyof MessageMock];

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [messages, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedMessages.length / itemsPerPage);
  const paginatedMessages = filteredAndSortedMessages.slice(
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
        <h1 className="text-2xl font-semibold text-gray-900">SMS Messaging</h1>
        <p className="mt-1 text-sm text-gray-500">Send SMS messages to officers and staff members.</p>
      </div>

      {/* Send Message Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FaPaperPlane className="text-blue-600 h-5 w-5" />
          <h2 className="text-lg font-medium text-gray-900">Compose Message</h2>
        </div>

        <div className="space-y-4">
          {/* Recipient Selector */}
          <div className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Recipient <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, phone, or department..."
                value={recipientSearch}
                onChange={(e) => handleRecipientSearchChange(e.target.value)}
                onFocus={() => setShowRecipientDropdown(true)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              {form.recipient_id && (
                <button
                  onClick={clearRecipient}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Recipient Dropdown */}
            {showRecipientDropdown && filteredOfficers.length > 0 && (
              <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {filteredOfficers.map((officer) => (
                  <div
                    key={officer.id}
                    onClick={() => handleRecipientSelect(officer)}
                    className="cursor-pointer px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {officer.first_name} {officer.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {officer.phone} • {officer.department}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Recipient Display */}
          {form.recipient_id && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-2">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Sending to:</span> {form.recipient_display} ({form.recipient_phone})
              </div>
            </div>
          )}

          {/* Message Content */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Type your message here..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              maxLength={500}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {form.content.length} / 500 characters
            </div>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSendMessage}
              disabled={!isFormValid()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FaPaperPlane className="h-4 w-4" />
              Send Message
            </button>
          </div>
        </div>
      </div>

      {/* Messages Table Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FaInbox className="text-gray-700 h-5 w-5" />
          <h2 className="text-lg font-medium text-gray-900">Message History</h2>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
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
                    onClick={() => handleSort('timestamp')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Timestamp <SortIcon columnKey="timestamp" />
                  </th>
                  <th
                    onClick={() => handleSort('recipient')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Recipient <SortIcon columnKey="recipient" />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">Phone</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Message</th>
                  <th
                    onClick={() => handleSort('status')}
                    className="cursor-pointer px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Status <SortIcon columnKey="status" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedMessages.length > 0 ? (
                  paginatedMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">{msg.timestamp}</td>
                      <td className="px-4 py-3 font-medium">{msg.recipient}</td>
                      <td className="px-4 py-3">{msg.recipient_phone}</td>
                      <td className="px-4 py-3">
                        <div className="max-w-md truncate" title={msg.content}>
                          {msg.content}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          msg.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : msg.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {msg.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No messages found
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
            Showing {paginatedMessages.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedMessages.length)} of{' '}
            {filteredAndSortedMessages.length} results
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

export default Messaging;
