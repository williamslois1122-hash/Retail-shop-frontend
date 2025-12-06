import { useState, useEffect } from 'react';
import { CreditCard, Search, ArrowRight, DollarSign } from 'lucide-react';
import { customersAPI } from '../api/customers';
import { debtsAPI } from '../api/debts';
import ViewDebtsModal from '../components/ViewDebtsModal';

interface Customer {
    id: number;
    name: string;
}

interface CustomerDebtSummary extends Customer {
    totalDebt: number;
    debtCount: number;
}

const Debts = () => {
    const [customers, setCustomers] = useState<CustomerDebtSummary[]>([]);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [totalOutstanding, setTotalOutstanding] = useState(0);

    useEffect(() => {
        fetchDebtors();
    }, []);

    const fetchDebtors = async () => {
        setLoading(true);
        try {
            // Fetch all customers
            const customersRes = await customersAPI.getAll();
            const allCustomers: Customer[] = Array.isArray(customersRes.data) ? customersRes.data : (customersRes.data.data || []);
            setAllCustomers(allCustomers);

            // For each customer, check if they have debts
            const debtorPromises = allCustomers.map(async (customer) => {
                try {
                    const debtsRes = await debtsAPI.getByCustomer(customer.id.toString());
                    const customerDebts = Array.isArray(debtsRes.data) ? debtsRes.data : [];

                    // Calculate total unpaid debt for this customer
                    const unpaidDebts = customerDebts.filter((debt: any) => !debt.repaid);
                    const totalDebt = unpaidDebts.reduce((sum: number, debt: any) => sum + debt.total_cost, 0);

                    if (totalDebt > 0) {
                        return {
                            ...customer,
                            totalDebt,
                            debtCount: unpaidDebts.length
                        };
                    }
                    return null;
                } catch (error) {
                    console.error(`Error fetching debts for customer ${customer.id}:`, error);
                    return null;
                }
            });

            const debtorsResults = await Promise.all(debtorPromises);
            const debtors = debtorsResults
                .filter((d): d is CustomerDebtSummary => d !== null)
                .sort((a, b) => b.totalDebt - a.totalDebt);

            setCustomers(debtors);
            setTotalOutstanding(debtors.reduce((sum, c) => sum + c.totalDebt, 0));

        } catch (error) {
            console.error('Error fetching debtors:', error);
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
                <h1 className="text-3xl font-bold text-gray-800">Debts Overview</h1>
                <p className="text-gray-600 mt-1">Customers with outstanding payments</p>
            </div>

            {/* Stats */}
            <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-red-100 text-sm">Total Outstanding Debt</p>
                        <p className="text-3xl font-bold mt-1">${totalOutstanding.toFixed(2)}</p>
                        <p className="text-red-100 text-xs mt-1">{customers.length} customers owe money</p>
                    </div>
                    <DollarSign className="w-12 h-12 text-red-200" />
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search debtors..."
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

            {/* Debtors List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading debtors...</div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CreditCard className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No Outstanding Debts</h3>
                        <p className="text-gray-500 mt-1">
                            {searchTerm ? 'No matching results.' : 'Great job! All customers are paid up.'}
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
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {customer.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {customer.debtCount} active debt(s)
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="font-bold text-red-600 text-lg">
                                            ${customer.totalDebt.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-400">Total Owed</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View Details Modal */}
            <ViewDebtsModal
                isOpen={!!selectedCustomer}
                onClose={() => {
                    setSelectedCustomer(null);
                    fetchDebtors(); // Refresh list on close in case debts were paid
                }}
                customer={selectedCustomer}
            />
        </div>
    );
};

export default Debts;
