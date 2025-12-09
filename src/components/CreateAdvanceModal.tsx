import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { advancesAPI } from '../api/advances';

interface Customer {
    id: number;
    name: string;
}

interface CreateAdvanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer;
    onSuccess: () => void;
}

const CreateAdvanceModal = ({ isOpen, onClose, customer, onSuccess }: CreateAdvanceModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: 0,
        used_amount: 0,
        pending_amount: 0,
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({ amount: 0, used_amount: 0, pending_amount: 0 });
        }
    }, [isOpen]);

    const handleAmountChange = (val: number) => {
        const newAmount = val >= 0 ? val : 0;
        setFormData(prev => ({
            ...prev,
            amount: newAmount,
            pending_amount: newAmount - prev.used_amount
        }));
    };

    const handleUsedAmountChange = (val: number) => {
        const newUsed = val >= 0 ? val : 0;
        setFormData(prev => ({
            ...prev,
            used_amount: newUsed,
            pending_amount: prev.amount - newUsed
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                customer_id: customer.id,
                amount: formData.amount,
                used_amount: formData.used_amount,
                pending_amount: formData.pending_amount
            };

            await advancesAPI.create(payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving advance:', error);
            alert('Failed to save advance. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg animate-fadeIn border border-border">
                <div className="flex justify-between items-center p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">
                            Add Advance
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">For {customer.name}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                className="input-field pl-7"
                                value={formData.amount || ''}
                                onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Used Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="input-field pl-7"
                                    value={formData.used_amount || ''}
                                    onChange={(e) => handleUsedAmountChange(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pending Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    readOnly
                                    className="input-field pl-7 bg-muted text-muted-foreground"
                                    value={formData.pending_amount.toFixed(2)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-3 justify-end pt-4 border-t border-border mt-6">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Advance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAdvanceModal;
