import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { debtsAPI } from '../api/debts';

interface ViewDebtsModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: { id: number; name: string } | null;
}

interface Debt {
    id: number;
    customer_id: number;
    item: string[];
    cost: number[];
    total_cost: number;
    date: string;
    repaid: boolean;
}

const ViewDebtsModal = ({ isOpen, onClose, customer }: ViewDebtsModalProps) => {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && customer) {
            fetchDebts();
        }
    }, [isOpen, customer]);

    const fetchDebts = async () => {
        if (!customer) return;
        setLoading(true);
        try {
            console.log(`Fetching debts for customer ID: ${customer.id}`); // Verification log
            const response = await debtsAPI.getByCustomer(customer.id.toString());
            setDebts(response.data);
        } catch (error) {
            console.error('Error fetching customer debts:', error);
            setDebts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRepaid = async (debtId: number) => {
        try {
            await debtsAPI.markRepaid(debtId.toString());
            fetchDebts(); // Refresh list after update
        } catch (error) {
            console.error('Error marking debt as repaid:', error);
            alert('Failed to update debt status.');
        }
    };

    if (!isOpen || !customer) return null;

    const totalOutstanding = debts.filter(d => !d.repaid).reduce((sum, d) => sum + d.total_cost, 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-slideUp">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Debts for {customer.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Customer ID: {customer.id} | Total Outstanding: <span className="font-bold text-red-600">${totalOutstanding.toFixed(2)}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading debts...</div>
                    ) : debts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No debts found for {customer.name}.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cost Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {debts.map((debt) => (
                                        <tr key={debt.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <ul className="list-disc list-inside">
                                                    {debt.item.map((item, idx) => (
                                                        <li key={idx} className="truncate max-w-xs" title={item}>{item}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <ul className="list-none">
                                                    {debt.cost.map((cost, idx) => (
                                                        <li key={idx}>${cost.toFixed(2)}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                ${debt.total_cost.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(debt.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${debt.repaid
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {debt.repaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {!debt.repaid && (
                                                    <button
                                                        onClick={() => handleMarkRepaid(debt.id)}
                                                        className="text-green-600 hover:text-green-900 flex items-center space-x-1 bg-green-50 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        <span>Repay</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewDebtsModal;
