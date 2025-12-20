import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapIcon,
    ExclamationTriangleIcon,
    ListBulletIcon,
    PlusIcon,
    XMarkIcon,
    HomeIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import FarmMapViewer from '../../components/Map/FarmMapViewer';
import { farmApi, issueApi } from '../../services/api';
import Toast from '../../components/Common/Toast';
import { useAuth } from '../../contexts/AuthContext';

const FarmMap = () => {
    const { user } = useAuth();
    const [farms, setFarms] = useState([]);
    const [selectedFarmId, setSelectedFarmId] = useState(null);
    const [nearbyIssues, setNearbyIssues] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [tempReportLocation, setTempReportLocation] = useState(null);

    // Report Form State
    const [reportForm, setReportForm] = useState({
        type: 'pest',
        severity: 'medium',
        description: ''
    });

    // Fetch Farms
    useEffect(() => {
        const fetchFarms = async () => {
            try {
                const response = await farmApi.getFarms();
                if (response.data?.status === 'success') {
                    setFarms(response.data.data.farms);
                    if (response.data.data.farms.length > 0) {
                        setSelectedFarmId(response.data.data.farms[0]._id);
                    }
                }
            } catch (error) {
                console.error("Error fetching farms:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFarms();
    }, []);

    // Fetch Nearby Issues when selected farm changes
    useEffect(() => {
        const fetchIssues = async () => {
            if (!selectedFarmId) return;

            const selectedFarm = farms.find(f => f._id === selectedFarmId);
            if (!selectedFarm) return;

            try {
                const [lon, lat] = selectedFarm.location?.centerPoint?.coordinates || [0, 0];
                const response = await issueApi.getNearby(lat, lon, 10); // 10km radius
                if (response.data?.success) {
                    setNearbyIssues(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching issues:", error);
            }
        };

        if (selectedFarmId && farms.length > 0) {
            fetchIssues();
        }
    }, [selectedFarmId, farms]);

    const handleIssueReport = (location) => {
        setTempReportLocation(location);
        setShowReportModal(true);
    };

    // Toast State
    const [toast, setToast] = useState(null); // { message, type }

    // ... (existing imports and code)

    const submitReport = async (e) => {
        e.preventDefault();
        if (!tempReportLocation) return;

        try {
            await issueApi.report({
                ...reportForm,
                latitude: tempReportLocation.lat,
                longitude: tempReportLocation.lng,
                farmId: selectedFarmId
            });

            // Refresh issues
            const selectedFarm = farms.find(f => f._id === selectedFarmId);
            if (selectedFarm) {
                const [lon, lat] = selectedFarm.location?.centerPoint?.coordinates || [0, 0];
                const response = await issueApi.getNearby(lat, lon, 10);
                if (response.data?.success) {
                    setNearbyIssues(response.data.data);
                }
            }

            setShowReportModal(false);
            setReportForm({ type: 'pest', severity: 'medium', description: '' });
            setToast({ message: 'Issue reported successfully!', type: 'success' });
        } catch (error) {
            console.error("Error reporting issue:", error);
            setToast({ message: 'Failed to report issue.', type: 'error' });
        }
    };

    const handleIssueDelete = async (issueId) => {
        if (!window.confirm("Are you sure you want to delete this issue?")) return;

        // Optimistic UI update
        const previousIssues = [...nearbyIssues];
        setNearbyIssues(prev => prev.filter(i => i._id !== issueId));
        // Close info window if open
        setToast({ message: 'Deleting issue...', type: 'info' });

        try {
            await issueApi.delete(issueId);
            setToast({ message: 'Issue deleted successfully!', type: 'success' });

            // We don't strictly need to refetch if we trust the delete was successful,
            // but we can do it silently or just rely on the optimistic update.
            // If we do refetch, we might get cached data back if we aren't careful.
            // For now, let's stick to the optimistic update as it's snappier.
        } catch (error) {
            console.error("Error deleting issue:", error);
            // Revert on failure
            setNearbyIssues(previousIssues);
            setToast({ message: 'Failed to delete issue.', type: 'error' });
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
            {/* Sidebar */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: sidebarOpen ? 0 : -300 }}
                className="absolute left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-md shadow-xl z-10 border-r border-gray-200 flex flex-col"
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-green-50">
                    <div className="flex items-center gap-2">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">🚜</span> My Farms
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard" className="p-1.5 rounded-full hover:bg-green-100 text-green-700 transition-colors" title="Back to Dashboard">
                            <HomeIcon className="w-5 h-5" />
                        </Link>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Loading farms...</div>
                    ) : farms.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No farms added yet.</div>
                    ) : (
                        farms.map(farm => (
                            <div
                                key={farm._id}
                                onClick={() => setSelectedFarmId(farm._id)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${selectedFarmId === farm._id
                                    ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.02]'
                                    : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-800">{farm.farmInfo.name}</h3>
                                    {selectedFarmId === farm._id && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                                </div>
                                <p className="text-xs text-gray-500 truncate mb-2">{farm.location.address}</p>
                                <div className="flex gap-2 text-xs">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                                        {farm.farmInfo.farmType}
                                    </span>
                                    <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                        {farm.farmInfo.totalArea.value ? Number(farm.farmInfo.totalArea.value).toFixed(2) : '0'} {farm.farmInfo.totalArea.unit}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Nearby Alerts Summary */}
                <div className="p-4 bg-red-50 border-t border-red-100">
                    <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4" /> Nearby Alerts
                    </h3>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                        {nearbyIssues.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">No nearby issues reported.</p>
                        ) : (
                            nearbyIssues.map(issue => (
                                <div key={issue._id} className="text-xs flex justify-between items-center p-2 bg-white rounded border border-red-100">
                                    <span className="capitalize font-medium text-gray-700">{issue.type}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${issue.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                        {issue.severity}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Toggle Sidebar Button (Permanent) */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="absolute left-4 top-4 z-20 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
                >
                    <ListBulletIcon className="w-6 h-6 text-gray-700" />
                </button>
            )}

            {/* Map Area */}
            <div className={`flex-1 h-full transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
                <FarmMapViewer
                    farms={farms}
                    selectedFarmId={selectedFarmId}
                    nearbyIssues={nearbyIssues}
                    currentUser={user}
                    onFarmClick={() => { }} // Could open details
                    onIssueReport={handleIssueReport}
                    onIssueDelete={handleIssueDelete}
                />
            </div>

            {/* Report Issue Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                                Report Issue
                            </h3>
                            <form onSubmit={submitReport} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                                    <select
                                        value={reportForm.type}
                                        onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    >
                                        <option value="pest">Pest Infestation</option>
                                        <option value="disease">Crop Disease</option>
                                        <option value="fire">Fire Hazard</option>
                                        <option value="flood">Flood Risk</option>
                                        <option value="drought">Severe Drought</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                    <select
                                        value={reportForm.severity}
                                        onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    >
                                        <option value="low">Low - Monitor</option>
                                        <option value="medium">Medium - Action Needed</option>
                                        <option value="high">High - Urgent</option>
                                        <option value="critical">Critical - Immediate Danger</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={reportForm.description}
                                        onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                        placeholder="Describe the issue..."
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowReportModal(false)}
                                        className="flex-1 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium"
                                    >
                                        Submit Report
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FarmMap;


