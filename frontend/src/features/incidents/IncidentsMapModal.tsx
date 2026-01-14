import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useState } from "react";
import { parsePoint } from "../../helpers/parse-point";
import { getMarkerIcon } from "../../helpers/marker-icon";
import { Incident } from "../../store/slices/incidentsSlice";

const containerStyle = { width: "100%", height: "500px" };

// Define color-coded marker icons
const statusIconMap = {
    reported: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    resolved: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    urgent: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
};


interface Props {
    incidents: Incident[];
    onClose: () => void;
}

const IncidentMapModal: React.FC<Props> = ({ incidents, onClose }) => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    });

    const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);
    const [activeIncident, setActiveIncident] = useState<Incident | null>(null);

    if (!isLoaded) return null;

    const points = incidents
        .map((i) => i.coordinates && parsePoint(i.coordinates))
        .filter(Boolean);

    const center = points.length
        ? points[0]
        : { lat: -1.286389, lng: 36.817223 }; // Nairobi fallback

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-5xl rounded-lg bg-white p-4">
                <div className="mb-2 flex justify-between">
                    <h2 className="text-lg font-semibold">Incident Map</h2>
                    <button onClick={onClose} className="text-sm text-red-600">Close</button>
                </div>

                <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
                    {incidents.map((incident) => {
                        if (!incident.coordinates) return null;
                        const position = parsePoint(incident.coordinates);
                        if (!position) return null;

                        return (
                            <Marker
                                key={incident.id}
                                position={position}
                                icon={statusIconMap[incident.status] || statusIconMap.reported}
                                onMouseOver={() => setHoveredIncident(incident)}
                                onMouseOut={() => setHoveredIncident(null)}
                                onClick={() => setActiveIncident(incident)}
                                label={
                                    hoveredIncident?.id === incident.id
                                        ? {
                                            text: incident.title,
                                            className: "marker-label",
                                        }
                                        : undefined
                                }
                            />
                        );
                    })}

                    {/* Hover label: styled via CSS */}
                    <style>
                        {`
            .marker-label {
              font-size: 12px;
              font-weight: 600;
              background: white;
              padding: 2px 4px;
              border-radius: 3px;
              border: 1px solid gray;
              white-space: nowrap;
              pointer-events: none;
            }
          `}
                    </style>

                    {/* Active incident InfoWindow */}
                    {activeIncident && activeIncident.coordinates && (
                        <InfoWindow
                            position={parsePoint(activeIncident.coordinates)}
                            onCloseClick={() => setActiveIncident(null)}
                        >
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold">{activeIncident.title}</p>
                                <p>Status: {activeIncident.status}</p>
                                <p>Type: {activeIncident.incident_type}</p>
                                <p>Area: {activeIncident.area?.name}</p>
                                {activeIncident.notes && <p>Notes: {activeIncident.notes}</p>}
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </div>
        </div>
    );
};

export default IncidentMapModal;
