import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { advancesAPI } from '../api/advances';

interface ViewAdvancesModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: { id: number; name: string } | null;
}

interface Advance {
    id: number;
    customer_id: number;
    amount: number;
    used_amount: number;
    pending_amount: number;
    date: string;
    repaid: boolean;
    status: 'active' | 'settled'; // Keeping for compatibility, though repaid boolean is primary for logic now
}

const ViewAdvancesModal = ({ isOpen, onClose, customer }: ViewAdvancesModalProps) => {
    const [advances, setAdvances] = useState<Advance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && customer) {
            fetchAdvances();
        }
    }, [isOpen, customer]);

    const fetchAdvances = async () => {
        if (!customer) return;
        setLoading(true);
        try {
            console.log(`Fetching advances for customer ID: ${customer.id}`);
            const response = await advancesAPI.getByCustomer(customer.id.toString());
            setAdvances(response.data);
        } catch (error) {
            console.error('Error fetching customer advances:', error);
            setAdvances([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRepaid = async (advanceId: number) => {
        try {
            await advancesAPI.markRepaid(advanceId.toString());
            fetchAdvances(); // Refresh list after update
        } catch (error) {
            console.error('Error marking advance as repaid:', error);
            alert('Failed to update advance status.');
        }
    };

    if (!isOpen || !customer) return null;

    const totalActive = advances.filter(a => !a.repaid).reduce((sum, a) => sum + a.amount, 0);
    const totalPending = advances.filter(a => !a.repaid).reduce((sum, a) => sum + a.pending_amount, 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-slideUp border border-border">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            Advances for {customer.name}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Customer ID: {customer.id} | Active Total: <span className="font-bold text-primary">${totalActive.toFixed(2)}</span> | Pending: <span className="font-bold text-destructive">${totalPending.toFixed(2)}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading advances...</div>
                    ) : advances.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No advances found for {customer.name}.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Used
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Pending
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {advances.map((advance) => (
                                        <tr key={advance.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">
                                                ${advance.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                ${advance.used_amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-destructive">
                                                ${advance.pending_amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                {new Date(advance.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${advance.repaid
                                                    ? 'bg-green-500/10 text-green-600'
                                                    : 'bg-yellow-500/10 text-yellow-600'
                                                    }`}>
                                                    {advance.repaid ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {!advance.repaid && (
                                                    <button
                                                        onClick={() => handleMarkRepaid(advance.id)}
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

export default ViewAdvancesModal;
