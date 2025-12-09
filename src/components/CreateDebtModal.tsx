import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { debtsAPI } from '../api/debts';

interface Customer {
    id: number;
    name: string;
}

interface CreateDebtModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer;
    onSuccess: () => void;
}

interface LineItem {
    name: string;
    cost: number;
}

const CreateDebtModal = ({ isOpen, onClose, customer, onSuccess }: CreateDebtModalProps) => {
    const [lineItems, setLineItems] = useState<LineItem[]>([{ name: '', cost: 0 }]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAddItem = () => {
        setLineItems([...lineItems, { name: '', cost: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = lineItems.filter((_, i) => i !== index);
        setLineItems(newItems.length ? newItems : [{ name: '', cost: 0 }]);
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...lineItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setLineItems(newItems);
    };

    const calculateTotal = () => {
        return lineItems.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const activeItems = lineItems.filter(item => item.name.trim() !== '');

        if (activeItems.length === 0) {
            alert('Please add at least one item');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                customer_id: customer.id,
                item: activeItems.map(i => i.name),
                cost: activeItems.map(i => i.cost),
                total_cost: calculateTotal()
            };

            await debtsAPI.create(payload);
            onSuccess();
            onClose();
            // Reset form
            setLineItems([{ name: '', cost: 0 }]);
        } catch (error) {
            console.error('Error saving debt:', error);
            alert('Failed to save debt. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
                <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card z-10">
                    <h2 className="text-xl font-bold text-foreground">
                        Add Debt for {customer.name}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Items</label>
                        {lineItems.map((item, index) => (
                            <div key={index} className="flex gap-3 items-start">
                                <div className="flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Item Name"
                                        required
                                        className="input-field"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        placeholder="Cost"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="input-field"
                                        value={item.cost || ''}
                                        onChange={(e) => handleItemChange(index, 'cost', parseFloat(e.target.value))}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="text-destructive hover:text-destructive/80 mt-2"
                                    title="Remove Item"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-sm text-primary hover:text-primary/80 font-medium flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Item
                        </button>
                    </div>

                    <div className="flex justify-end border-t pt-4">
                        <div className="text-lg font-bold text-gray-800">
                            Total Cost: ${calculateTotal().toFixed(2)}
                        </div>
                    </div>

                    <div className="flex space-x-3 justify-end pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Debt'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default CreateDebtModal;
