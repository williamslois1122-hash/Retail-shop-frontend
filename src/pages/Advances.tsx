import { useState, useEffect } from 'react';
import { TrendingUp, Search, ArrowRight } from 'lucide-react';
import { customersAPI } from '../api/customers';
import { advancesAPI } from '../api/advances';
import ViewAdvancesModal from '../components/ViewAdvancesModal';

interface Customer {
    id: number;
    name: string;
}

interface CustomerAdvanceSummary extends Customer {
    totalPending: number;
    advanceCount: number;
}

const Advances = () => {
    const [customers, setCustomers] = useState<CustomerAdvanceSummary[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [totalActive, setTotalActive] = useState(0);

    useEffect(() => {
        fetchAdvances();
    }, []);

    const fetchAdvances = async () => {
        setLoading(true);
        try {
            // Fetch all customers
            const customersRes = await customersAPI.getAll();
            const allCustomers: Customer[] = Array.isArray(customersRes.data) ? customersRes.data : (customersRes.data.data || []);
            setAllCustomers(allCustomers);

            // For each customer, check if they have advances
            const advancePromises = allCustomers.map(async (customer) => {
                try {
                    const advancesRes = await advancesAPI.getByCustomer(customer.id.toString());
                    const customerAdvances = Array.isArray(advancesRes.data) ? advancesRes.data : [];

                    // Calculate total pending for this customer
                    const activeAdvances = customerAdvances.filter((advance: any) => !advance.repaid);
                    const totalPending = activeAdvances.reduce((sum: number, advance: any) => sum + advance.pending_amount, 0);

                    if (totalPending > 0) {
                        return {
                            ...customer,
                            totalPending,
                            advanceCount: activeAdvances.length
                        };
                    }
                    return null;
                } catch (error) {
                    console.error(`Error fetching advances for customer ${customer.id}:`, error);
                    return null;
                }
            });

            const advancesResults = await Promise.all(advancePromises);
            const activeCustomers = advancesResults
                .filter((a): a is CustomerAdvanceSummary => a !== null)
                .sort((a, b) => b.totalPending - a.totalPending);

            setCustomers(activeCustomers);
            setTotalActive(activeCustomers.reduce((sum, c) => sum + c.totalPending, 0));

        } catch (error) {
            console.error('Error fetching advances:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = selectedCustomerId === 'all' || c.id.toString() === selectedCustomerId;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Advances Overview</h1>
                <p className="text-gray-600 mt-1">Customers with active advances</p>
            </div>

            {/* Stats */}
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm">Total Active Advances</p>
                        <p className="text-3xl font-bold mt-1">${totalActive.toFixed(2)}</p>
                        <p className="text-blue-100 text-xs mt-1">{customers.length} customers</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-blue-200" />
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <select
                        className="input-field"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                        <option value="all">All Customers</option>
                        {allCustomers.map((customer) => (
                            <option key={customer.id} value={customer.id.toString()}>
                                {customer.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading advances...</div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Active Advances</h3>
                        <p className="text-gray-500 mt-1">
                            {searchTerm ? 'No matching results.' : 'No customers currently have pending advances.'}
                        </p>
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <div
                            key={customer.id}
                            onClick={() => setSelectedCustomer(customer)}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {customer.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {customer.advanceCount} active advance(s)
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="font-bold text-blue-600 text-lg">
                                            ${customer.totalPending.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-400">Total Pending</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View Details Modal */}
            <ViewAdvancesModal
                isOpen={!!selectedCustomer}
                onClose={() => {
                    setSelectedCustomer(null);
                    fetchAdvances(); // Refresh list on close in case advances were paid
                }}
                customer={selectedCustomer}
            />
        </div>
    );
};

export default Advances;
