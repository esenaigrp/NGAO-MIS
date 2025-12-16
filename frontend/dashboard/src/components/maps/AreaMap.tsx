// src/components/AreaMap.tsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster"; // ✅ use this only
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchUserAreas } from "../../store/slices/areasSlice";
import { fetchOfficers } from "../../store/slices/officersSlice";
import L from "leaflet";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

type Area = {
  id: number;
  name: string;
  code: string;
  area_type: string;
  parent?: number;
  boundary?: any;
};

type Officer = {
  id: number;
  name: string;
  role: string;
  area_code: string;
  lat?: number;
  lng?: number;
};

// Base colors
const baseColors: Record<string, string> = {
  sub_county: "#1f77b4",
  division: "#ff7f0e",
  location: "#2ca02c",
  sublocation: "#d62728",
  village: "#9467bd",
};

function lightenColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.round((num >> 16) + 255 * percent));
  const g = Math.min(255, Math.round(((num >> 8) & 0x00ff) + 255 * percent));
  const b = Math.min(255, Math.round((num & 0x0000ff) + 255 * percent));
  return `rgb(${r},${g},${b})`;
}

// Fit map to bounds
const FitBounds: React.FC<{ bounds: any }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [20, 20] });
  }, [bounds, map]);
  return null;
};

const AreaMap: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userAreas, loading, error } = useSelector((state: RootState) => state.areas);
  const { officers } = useSelector((state: RootState) => state.officers);

  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    sub_county: true,
    division: true,
    location: true,
    sublocation: true,
    village: true,
  });

  const [currentParent, setCurrentParent] = useState<number | null>(null);
  const [bounds, setBounds] = useState<any>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Area[]>([]);

  useEffect(() => {
    dispatch(fetchUserAreas());
  }, [dispatch]);

  const handleToggleLayer = (type: string) => {
    setVisibleLayers(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleAreaClick = (area: Area) => {
    dispatch(fetchOfficers(area.code));
    setCurrentParent(area.id);
    setBreadcrumbs(prev => [...prev, area]);

    if (area.boundary) {
      const coordinates = area.boundary.coordinates.flat(3).map((coord: number[]) => [coord[1], coord[0]]);
      setBounds(coordinates);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbs[index];
    dispatch(fetchOfficers(target.code));
    setCurrentParent(target.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));

    if (target.boundary) {
      const coordinates = target.boundary.coordinates.flat(3).map((coord: number[]) => [coord[1], coord[0]]);
      setBounds(coordinates);
    }
  };

  if (loading) return <div>Loading map areas...</div>;
  if (error) return <div>Error loading areas: {error}</div>;

  // Filter areas by parent and visible layers
  const geoJsons = userAreas
    .filter(a => a.boundary && visibleLayers[a.area_type])
    .filter(a => (currentParent ? a.parent === currentParent : a.area_type === "sub_county"))
    .map(a => ({
      type: "Feature",
      properties: {
        id: a.id,
        name: a.name,
        code: a.code,
        area_type: a.area_type,
        parent_code: a.parent,
      },
      geometry: a.boundary,
    }));

  const styleByType = (type: string) => ({
    color: lightenColor(baseColors[type] || "#7f7f7f", 0.3),
    weight: 2,
    fillOpacity: 0.6,
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 250, padding: 12, background: "#f8f8f8", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <h4>Layers</h4>
        {Object.keys(baseColors).map(type => (
          <div key={type} style={{ marginBottom: 4 }}>
            <input
              type="checkbox"
              checked={visibleLayers[type]}
              onChange={() => handleToggleLayer(type)}
            />{" "}
            {type}
          </div>
        ))}

        <h4 style={{ margin: "20px 0 10px 0" }}>Legend</h4>
        {Object.entries(baseColors).map(([type, color]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
            <div style={{ width: 20, height: 20, backgroundColor: color, marginRight: 8, border: "1px solid #000" }} />
            <span>{type}</span>
          </div>
        ))}

        {breadcrumbs.length > 0 && (
          <>
            <h4 style={{ marginTop: 20 }}>Breadcrumbs</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button
                onClick={() => {
                  setCurrentParent(null);
                  setBreadcrumbs([]);
                  setBounds(null);
                  dispatch(fetchOfficers("")); // clear officers
                }}
                style={{ background: "#ddd", border: "none", padding: "2px 6px", borderRadius: 3, cursor: "pointer" }}
              >
                Home
              </button>
              {breadcrumbs.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => handleBreadcrumbClick(idx)}
                  style={{ background: "#eee", border: "none", padding: "2px 6px", borderRadius: 3, cursor: "pointer" }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </>
        )}

        {officers.length > 0 && (
          <>
            <h4 style={{ marginTop: 20 }}>Officers</h4>
            <ul style={{ paddingLeft: 12 }}>
              {officers.map(o => (
                <li key={o.id}>{o.name} ({o.role})</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Map */}
      <MapContainer center={[0.0236, 37.9062]} zoom={6} style={{ flex: 1 }} scrollWheelZoom>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {bounds && <FitBounds bounds={bounds} />}

        {/* GeoJSON Areas */}
        {geoJsons.map((feature, idx) => (
          <GeoJSON
            key={idx}
            data={feature}
            style={() => styleByType(feature.properties.area_type)}
            eventHandlers={{
              click: () => handleAreaClick(feature.properties as Area),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
              <div>
                <strong>{feature.properties.name}</strong>
                <br />
                Code: {feature.properties.code}
                <br />
                Type: {feature.properties.area_type}
              </div>
            </Tooltip>
          </GeoJSON>
        ))}

        {/* Officer Markers with Clustering */}
        <MarkerClusterGroup>
          {officers.map(o => 
            o.lat && o.lng ? (
              <Marker key={o.id} position={[o.lat, o.lng]}>
                <Popup>
                  <strong>{o.name}</strong>
                  <br />
                  {o.role}
                </Popup>
              </Marker>
            ) : null
          )}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default AreaMap;
