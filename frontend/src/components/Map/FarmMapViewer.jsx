import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, Marker, Circle, InfoWindow } from '@react-google-maps/api';
import { TrashIcon } from '@heroicons/react/24/outline';

const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem'
};

const options = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
};

const FarmMapViewer = ({
    farms,
    selectedFarmId,
    nearbyIssues,
    currentUser,
    onFarmClick,
    onIssueReport,
    onIssueDelete
}) => {
    // ... (rest of code)


    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [map, setMap] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [reportLocation, setReportLocation] = useState(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    // Fit bounds when selected farm changes
    // Fit bounds when selected farm changes
    useEffect(() => {
        if (map && farms.length > 0) {
            console.log('FarmMapViewer: Farms data:', farms)
            console.log('FarmMapViewer: Selected Farm ID:', selectedFarmId)

            if (selectedFarmId) {
                const farm = farms.find(f => f._id === selectedFarmId);
                console.log('FarmMapViewer: Selected Farm:', farm)

                if (farm) {
                    const bounds = new window.google.maps.LatLngBounds();
                    let hasPoints = false;

                    // 1. Try Boundary
                    if (farm.location?.boundary?.coordinates?.[0] && farm.location.boundary.coordinates[0].length > 0) {
                        console.log('FarmMapViewer: Using farm boundary for centering')
                        const coords = farm.location.boundary.coordinates[0];
                        coords.forEach(coord => {
                            bounds.extend({ lat: coord[1], lng: coord[0] });
                            hasPoints = true;
                        });
                    }
                    // 2. Try Center Point (GeoJSON Point)
                    else if (farm.location?.centerPoint?.coordinates) {
                        const [lng, lat] = farm.location.centerPoint.coordinates;
                        if (lat && lng) {
                            console.log('FarmMapViewer: Using centerPoint for centering', { lat, lng })
                            map.panTo({ lat, lng });
                            map.setZoom(16);
                            return; // Exit as we've already set the view
                        }
                    }
                    // 3. Try Legacy Coordinates (if any)
                    else if (farm.location?.coordinates && farm.location.coordinates.length === 2) {
                        const [lng, lat] = farm.location.coordinates; // Assuming [lng, lat] format
                        if (lat && lng) {
                            console.log('FarmMapViewer: Using legacy coordinates for centering', { lat, lng })
                            map.panTo({ lat, lng });
                            map.setZoom(16);
                            return;
                        }
                    }

                    if (hasPoints) {
                        map.fitBounds(bounds);
                    } else {
                        console.warn('FarmMapViewer: No location data found for selected farm')
                    }
                }
            } else {
                // Fit all farms if none selected
                const bounds = new window.google.maps.LatLngBounds();
                let hasPoints = false;
                farms.forEach(farm => {
                    // Try boundary
                    if (farm.location?.boundary?.coordinates?.[0]) {
                        farm.location.boundary.coordinates[0].forEach(coord => {
                            bounds.extend({ lat: coord[1], lng: coord[0] });
                            hasPoints = true;
                        });
                    }
                    // Try center point
                    else if (farm.location?.centerPoint?.coordinates) {
                        const [lng, lat] = farm.location.centerPoint.coordinates;
                        if (lat && lng) {
                            bounds.extend({ lat, lng });
                            hasPoints = true;
                        }
                    }
                });

                if (hasPoints) {
                    map.fitBounds(bounds);
                }
            }
        }
    }, [map, farms, selectedFarmId]);

    const handleMapClick = (e) => {
        // Only allow reporting if a farm is selected (or logic can be adjusted)
        setReportLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        setSelectedIssue(null);
    };

    const getIssueIcon = (type) => {
        // Simple colored markers for now, can be replaced with custom SVGs
        switch (type) {
            case 'fire': return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
            case 'pest': return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
            case 'flood': return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            case 'disease': return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
            default: return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
        }
    };

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl animate-pulse">
                <div className="text-gray-400 font-medium">Loading Map...</div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={5}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={options}
                onClick={handleMapClick}
            >
                {/* Render Farms */}
                {farms.map(farm => (
                    <Polygon
                        key={farm._id}
                        paths={farm.location.boundary.coordinates[0].map(c => ({ lat: c[1], lng: c[0] }))}
                        options={{
                            fillColor: selectedFarmId === farm._id ? '#22c55e' : '#9ca3af',
                            fillOpacity: selectedFarmId === farm._id ? 0.4 : 0.2,
                            strokeColor: selectedFarmId === farm._id ? '#16a34a' : '#6b7280',
                            strokeOpacity: 1,
                            strokeWeight: 2,
                        }}
                        onClick={() => onFarmClick(farm._id)}
                    />
                ))}

                {/* Render Issues */}
                {nearbyIssues.map(issue => (
                    <React.Fragment key={issue._id}>
                        <Marker
                            position={{ lat: issue.location.coordinates[1], lng: issue.location.coordinates[0] }}
                            icon={getIssueIcon(issue.type)}
                            onClick={() => {
                                setSelectedIssue(issue);
                                setReportLocation(null);
                            }}
                            animation={window.google.maps.Animation.DROP}
                        />
                        {/* Visual Alert Radius for active high severity issues */}
                        {(issue.severity === 'high' || issue.severity === 'critical') && (
                            <Circle
                                center={{ lat: issue.location.coordinates[1], lng: issue.location.coordinates[0] }}
                                radius={issue.radius || 1000}
                                options={{
                                    fillColor: '#ef4444',
                                    fillOpacity: 0.2,
                                    strokeColor: '#ef4444',
                                    strokeOpacity: 0.5,
                                    strokeWeight: 1,
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}

                {/* Info Window for Issues */}
                {selectedIssue && (
                    <InfoWindow
                        position={{ lat: selectedIssue.location.coordinates[1], lng: selectedIssue.location.coordinates[0] }}
                        onCloseClick={() => setSelectedIssue(null)}
                    >
                        <div className="p-2 min-w-[200px]">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-gray-800 capitalize">{selectedIssue.type} Alert</h3>
                                {currentUser?._id === selectedIssue.reportedBy?._id && (
                                    <button
                                        onClick={() => onIssueDelete(selectedIssue._id)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                        title="Delete Issue"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{selectedIssue.description}</p>
                            <div className="flex justify-between items-center text-xs">
                                <span className={`px-2 py-0.5 rounded-full ${selectedIssue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                    selectedIssue.severity === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {selectedIssue.severity.toUpperCase()}
                                </span>
                                <div className="text-right">
                                    <div className="text-gray-500 font-medium">
                                        {selectedIssue.reportedBy?.personalInfo?.firstName}
                                    </div>
                                    <div className="text-gray-400">
                                        {new Date(selectedIssue.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </InfoWindow>
                )}

                {/* Info Window for Reporting */}
                {reportLocation && (
                    <InfoWindow
                        position={reportLocation}
                        onCloseClick={() => setReportLocation(null)}
                    >
                        <div className="p-2">
                            <p className="font-semibold mb-2 text-sm">Report Issue Here?</p>
                            <button
                                onClick={() => {
                                    onIssueReport(reportLocation);
                                    setReportLocation(null);
                                }}
                                className="btn-primary py-1 px-3 text-xs w-full"
                            >
                                Report
                            </button>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

import React from 'react'; // Importing React for Fragment
export default FarmMapViewer;
