import { useState, useEffect } from 'react';
import { Plus, Edit2, Package as PackageIcon } from 'lucide-react';
import { itemsAPI } from '../api/items';

interface Item {
    id: number;
    name: string;
    min_price: number;
    max_price: number;
}

const Items = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        min_price: 0,
        max_price: 0,
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await itemsAPI.getAll();
            // Handle potential response structures
            const data = Array.isArray(response.data) ? response.data : (response.data?.items || []);
            setItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await itemsAPI.update(editingId.toString(), formData);
            } else {
                await itemsAPI.create(formData);
            }
            setShowForm(false);
            fetchItems();
            resetForm();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Failed to save item. Please try again.');
        }
    };

    const handleEdit = (item: Item) => {
        setFormData({
            name: item.name,
            min_price: item.min_price,
            max_price: item.max_price,
        });
        setEditingId(item.id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            min_price: 0,
            max_price: 0,
        });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Items Management</h1>
                    <p className="text-gray-600 mt-1">Manage your item inventory</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Item</span>
                </button>
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Items</p>
                            <p className="text-3xl font-bold mt-1">{items.length}</p>
                        </div>
                        <PackageIcon className="w-12 h-12 text-blue-200" />
                    </div>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="card">
                    <h2 className="text-xl font-semibold mb-4">
                        {editingId ? 'Edit Item' : 'Add New Item'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter item name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="input-field"
                                    value={formData.min_price}
                                    onChange={(e) => setFormData({ ...formData, min_price: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="input-field"
                                    value={formData.max_price}
                                    onChange={(e) => setFormData({ ...formData, max_price: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button type="submit" className="btn-primary">
                                {editingId ? 'Update Item' : 'Add Item'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Items List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading items...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No items found. Add your first item!
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                ${item.min_price.toFixed(2)} - ${item.max_price.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-primary-600 hover:text-primary-900 bg-primary-50 p-2 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Items;
