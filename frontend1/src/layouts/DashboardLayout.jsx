import Navbar from '../components/Navbar';
import '../styles/navbar.css';

export default function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout-container">
            {/* Swaps from left-bar to top-bar seamlessly via CSS queries */}
            <Navbar />

            {/* Dynamic View Canvas Area */}
            <main className="dashboard-main-canvas">
                {children}
            </main>
        </div>
    );
}