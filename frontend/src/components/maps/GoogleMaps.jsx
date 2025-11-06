import React, { useEffect, useRef } from "react";

export const GoogleMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    let map;

    const center = { lat: -34.397, lng: 150.644 };

    async function initMap() {
      // Ensure Google Maps API is loaded
      await google.maps.importLibrary("maps");
      await google.maps.importLibrary("marker");

      map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 8,
        mapId: "DEMO_MAP_ID",
      });

      // Add marker
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: center,
      });
    }

    initMap();
  }, []);

  return (
    <div
      id="map"
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "10px",
      }}
    />
  );
};

export default GoogleMap;
