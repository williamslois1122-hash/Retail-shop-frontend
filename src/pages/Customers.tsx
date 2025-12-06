import { useState, useEffect } from 'react';
import { Plus, Edit2, Users as UsersIcon, CreditCard, TrendingUp, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { customersAPI } from '../api/customers';
import CreateDebtModal from '../components/CreateDebtModal';
import CreateAdvanceModal from '../components/CreateAdvanceModal';
import ViewDebtsModal from '../components/ViewDebtsModal';
import ViewAdvancesModal from '../components/ViewAdvancesModal';

interface Customer {
    id: number;
    name: string;
    created_at: string;
}

const Customers = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [activeModal, setActiveModal] = useState<'debt' | 'advance' | 'viewDebts' | 'viewAdvances' | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customersAPI.getAll();
            // Handle the response data - it might be in response.data or response.data.data
            const customerData = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setCustomers(customerData);
        } catch (error) {
            console.error('Error fetching customers:', error);
            // Set empty array on error instead of mock data
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await customersAPI.update(editingId.toString(), { name: formData.name });
            } else {
                await customersAPI.create({ name: formData.name });
            }
            fetchCustomers();
            resetForm();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Failed to save customer. Please try again.');
        }
    };

    const handleEdit = (customer: Customer) => {
        setFormData({
            name: customer.name,
        });
        setEditingId(customer.id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Customers Management</h1>
                    <p className="text-gray-600 mt-1">Manage your customer relationships</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Customer</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm">Total Customers</p>
                            <p className="text-3xl font-bold mt-1">{customers.length}</p>
                        </div>
                        <UsersIcon className="w-12 h-12 text-indigo-200" />
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Recent Additions</p>
                            <p className="text-3xl font-bold mt-1">
                                {customers.filter(c => {
                                    const createdDate = new Date(c.created_at);
                                    const today = new Date();
                                    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays <= 7;
                                }).length}
                            </p>
                            <p className="text-green-100 text-xs mt-1">Last 7 days</p>
                        </div>
                        <Plus className="w-12 h-12 text-green-200" />
                    </div>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? 'Edit Customer' : 'Add New Customer'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="Enter customer name"
                                value={formData.name}
                                onChange={(e) => setFormData({ name: e.target.value })}
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button type="submit" className="btn-primary">
                                {editingId ? 'Update Customer' : 'Add Customer'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Customers List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading customers...</div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No customers.
                    </div>
                ) : (
                    customers.map((customer) => (
                        <div
                            key={customer.id}
                            onClick={() => setExpandedId(expandedId === customer.id ? null : customer.id)}
                            className={`card hover:shadow-lg transition-all cursor-pointer ${expandedId === customer.id ? 'ring-2 ring-primary-500' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">{customer.name}</h3>
                                    <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full mt-1">
                                        Added: {new Date(customer.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(customer);
                                        }}
                                        className="text-gray-400 hover:text-primary-600 transition-colors p-2"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    {expandedId === customer.id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded Quick Actions */}
                            {expandedId === customer.id && (
                                <div className="mt-4 pt-4 border-t animate-fadeIn">
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCustomer(customer);
                                                setActiveModal('debt');
                                            }}
                                            className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-lg transition-colors"
                                        >
                                            <CreditCard className="w-5 h-5" />
                                            <span className="font-medium">Add Debt</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCustomer(customer);
                                                setActiveModal('advance');
                                            }}
                                            className="flex items-center justify-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-lg transition-colors"
                                        >
                                            <TrendingUp className="w-5 h-5" />
                                            <span className="font-medium">Add Advance</span>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCustomer(customer);
                                                setActiveModal('viewDebts');
                                            }}
                                            className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors border border-gray-200"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="font-medium text-sm">View Debts</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCustomer(customer);
                                                setActiveModal('viewAdvances');
                                            }}
                                            className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors border border-gray-200"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span className="font-medium text-sm">View Advance</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            {selectedCustomer && (
                <>
                    <CreateDebtModal
                        isOpen={activeModal === 'debt'}
                        onClose={() => {
                            setActiveModal(null);
                            setSelectedCustomer(null);
                        }}
                        customer={selectedCustomer}
                        onSuccess={() => {
                            // Optional: Refresh customer list or show notification
                            console.log('Debt created successfully');
                        }}
                    />
                    <CreateAdvanceModal
                        isOpen={activeModal === 'advance'}
                        onClose={() => {
                            setActiveModal(null);
                            setSelectedCustomer(null);
                        }}
                        customer={selectedCustomer}
                        onSuccess={() => {
                            // Optional: Refresh customer list or show notification
                            console.log('Advance created successfully');
                        }}
                    />
                    <ViewDebtsModal
                        isOpen={activeModal === 'viewDebts'}
                        onClose={() => {
                            setActiveModal(null);
                            setSelectedCustomer(null);
                        }}
                        customer={selectedCustomer}
                    />
                    <ViewAdvancesModal
                        isOpen={activeModal === 'viewAdvances'}
                        onClose={() => {
                            setActiveModal(null);
                            setSelectedCustomer(null);
                        }}
                        customer={selectedCustomer}
                    />
                </>
            )}
        </div>
    );
};

export default Customers;