import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Customers from './pages/Customers';
import Debts from './pages/Debts';
import Advances from './pages/Advances';
import Items from './pages/Items';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="ml-64 px-8 py-8">
                    <Routes>
                        <Route path="/" element={<Navigate to="/customers" replace />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/debts" element={<Debts />} />
                        <Route path="/advances" element={<Advances />} />
                        <Route path="/items" element={<Items />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
