import React, { useState, useEffect } from 'react';
import { getCombinedInsights } from '../../services/insightsService';
import {
    CloudRain,
    Droplet,
    Sprout,
    AlertTriangle,
    CheckCircle,
    Info,
    Activity
} from 'lucide-react';

const RiskAnalysisWidget = ({ location }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            // Handle missing location immediately
            if (!location) {
                setError('Location missing');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                let lat, lon;
                // Handle GeoJSON format: { type: 'Point', coordinates: [lon, lat] }
                if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
                    lon = location.coordinates[0];
                    lat = location.coordinates[1];
                } else {
                    // Handle standard object format
                    lat = location.lat || location.latitude;
                    lon = location.lon || location.longitude;
                }

                if (!lat || !lon) {
                    setError('Invalid coordinates');
                    setLoading(false);
                    return;
                }

                console.log('Fetching insights for:', lat, lon); // Debug log

                const insights = await getCombinedInsights(lat, lon);

                if (isMounted) {
                    setData(insights);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    console.error(err);
                    setError('Failed to load risk analysis');
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [location]);

    // Helper to determine badge color
    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'poor': return 'bg-red-100 text-red-800 border-red-200';
            case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'excellent': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRiskIcon = (level) => {
        const l = level?.toLowerCase();
        if (l === 'high' || l === 'poor') return <AlertTriangle size={16} />;
        if (l === 'low' || l === 'excellent') return <CheckCircle size={16} />;
        return <Info size={16} />;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3"></div>
                <p className="text-gray-500 text-sm animate-pulse">Analyzing satellite data...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-center items-center text-center">
                <Activity className="text-gray-300 mb-3" size={32} />
                <p className="text-gray-500 text-sm">{error || 'Analysis unavailable'}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-green-600 text-xs hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Activity className="text-green-600" size={20} />
                        AI Environmental Risks
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Real-time analysis via Google Earth Engine (20y historical comparison)
                    </p>
                </div>
                <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded border border-gray-100">
                    LIVE
                </span>
            </div>

            <div className="space-y-4">
                {/* 1. Drought Risk */}
                <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100/50">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-orange-100 rounded text-orange-600">
                                <CloudRain size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Drought Risk</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(data.drought?.riskLevel)}`}>
                            {getRiskIcon(data.drought?.riskLevel)}
                            {data.drought?.riskLevel || 'Unknown'}
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 pl-9">
                        <span>Precipitation Anomaly:</span>
                        <span className="font-medium">
                            {data.drought?.anomalyPercentage ? `${data.drought.anomalyPercentage}%` : 'N/A'}
                        </span>
                    </div>
                </div>

                {/* 2. Vegetation Health */}
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-100 rounded text-emerald-600">
                                <Sprout size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Crop Health</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(data.vegetation?.healthStatus)}`}>
                            {getRiskIcon(data.vegetation?.healthStatus)}
                            {data.vegetation?.healthStatus || 'Unknown'}
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 pl-9">
                        <span>NDVI Index:</span>
                        <span className="font-medium">
                            {data.vegetation?.ndviValue || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* 3. Flood Risk */}
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded text-blue-600">
                                <Droplet size={16} />
                            </div>
                            <span className="text-sm font-medium text-gray-700">Flood Risk</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(data.flood?.riskLevel)}`}>
                            {getRiskIcon(data.flood?.riskLevel)}
                            {data.flood?.riskLevel || 'Unknown'}
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 pl-9">
                        <span>Recent Accumulation:</span>
                        <span className="font-medium">
                            {data.flood?.recentAccumulation ? `${data.flood.recentAccumulation}mm` : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                <p>Sources: CHIRPS (Rain), MODIS (NDVI)</p>
                <p>Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    );
};

export default RiskAnalysisWidget;
