import React, { useState, useEffect } from 'react';
import { getCombinedInsights } from '../../services/insightsService';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    CloudRain,
    Droplet,
    Sprout,
    AlertTriangle,
    CheckCircle,
    Info,
    Activity,
    Sparkles,
    TrendingUp
} from 'lucide-react';

const RiskAnalysisWidget = ({ location }) => {
    const { t } = useLanguage();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if (!location) {
                setError('Location missing');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                let lat, lon;
                if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
                    lon = location.coordinates[0];
                    lat = location.coordinates[1];
                } else {
                    lat = location.lat || location.latitude;
                    lon = location.lon || location.longitude;
                }

                if (!lat || !lon) {
                    setError('Invalid coordinates');
                    setLoading(false);
                    return;
                }

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

    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'text-green-600';
            case 'moderate': return 'text-yellow-600';
            case 'high': return 'text-red-600';
            case 'poor': return 'text-red-600';
            case 'excellent': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getProgressColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'bg-green-500';
            case 'moderate': return 'bg-yellow-500';
            case 'high': return 'bg-red-500';
            case 'poor': return 'bg-red-500';
            case 'excellent': return 'bg-green-500';
            default: return 'bg-gray-300';
        }
    }

    const getRiskValue = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 25;
            case 'moderate': return 50;
            case 'high': return 85;
            case 'poor': return 20;
            case 'excellent': return 90;
            case 'good': return 75;
            default: return 50;
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-50"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-3" />
                    <p className="text-gray-500 text-sm font-medium animate-pulse">{t('analyzingData')}</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-50"></div>
                <Activity className="text-gray-300 mb-3 relative z-10" size={32} />
                <p className="text-gray-500 text-sm relative z-10">{error || t('analysisUnavailable')}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-green-600 text-xs font-semibold hover:underline relative z-10"
                >
                    {t('retryAnalysis')}
                </button>
            </div>
        );
    }

    const RiskItem = ({ title, icon: IconComponent, level, value, unit, type }) => {
        const percent = type === 'health'
            ? (level?.toLowerCase() === 'excellent' ? 95 : level?.toLowerCase() === 'good' ? 75 : 30)
            : (level?.toLowerCase() === 'high' ? 85 : level?.toLowerCase() === 'moderate' ? 50 : 15);

        const translatedLevel = level ? t(`riskLevels.${level.toLowerCase()}`, level) : level;

        return (
            <div className="group relative">
                <div className="flex justify-between items-end mb-1">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${type === 'drought' ? 'bg-orange-100 text-orange-600' : type === 'flood' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <IconComponent size={16} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{title}</span>
                    </div>
                    <div className="text-right">
                        <span className={`text-xs font-bold uppercase tracking-wider ${getRiskColor(level)}`}>
                            {translatedLevel || 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* Progress Bar Background */}
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                    {/* Animated Progress Bar */}
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(level)}`}
                        style={{ width: `${percent}%` }}
                    ></div>
                </div>

                <div className="flex justify-end mt-1">
                    <span className="text-[10px] text-gray-400 font-medium">
                        {value ? `${value}${unit || ''}` : 'N/A'}
                    </span>
                </div>
            </div>
        )
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 h-full relative overflow-hidden">
            {/* Header decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100/50 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                        <Sparkles className="text-green-500 fill-current" size={18} />
                        {t('aiRiskAnalysis')}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                        {t('satelliteDiagnostics')}
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        {t('live')}
                    </span>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <RiskItem
                    title={t('droughtRisk')}
                    icon={CloudRain}
                    level={data.drought?.riskLevel}
                    value={data.drought?.anomalyPercentage}
                    unit="%"
                    type="drought"
                />

                <RiskItem
                    title={t('cropHealth')}
                    icon={Sprout}
                    level={data.vegetation?.healthStatus}
                    value={data.vegetation?.ndviValue}
                    unit=" NDVI"
                    type="health"
                />

                <RiskItem
                    title={t('floodRisk')}
                    icon={Droplet}
                    level={data.flood?.riskLevel}
                    value={data.flood?.recentAccumulation}
                    unit="mm"
                    type="flood"
                />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] text-gray-400 font-medium">
                <div className="flex items-center gap-1">
                    <Activity size={10} />
                    <span>{t('basedOnHistory')}</span>
                </div>
                <p>{t('updated')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    );
};

// Helper for loading state
const Loader2 = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default RiskAnalysisWidget;
