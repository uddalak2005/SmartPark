import React, { useState, useEffect } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';

const DirectionsComponent = ({ origin, destination, travelMode = 'DRIVING' }) => {
  const map = useMap(); // Get the map instance from context
  const routesLibrary = useMapsLibrary('routes'); // Load the routes library
  const [directionsResult, setDirectionsResult] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  // Initialize the services once the library and map are loaded
  useEffect(() => {
    if (!routesLibrary || !map) return;
    
    // Create DirectionsService and DirectionsRenderer instances
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  // Request the route whenever services or locations change
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) return;

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: travelMode,
      },
      (result, status) => {
        if (status === 'OK') {
          // Set the calculated directions result onto the renderer
          directionsRenderer.setDirections(result);
          setDirectionsResult(result);
        } else {
          console.error(`Directions request failed: ${status}`);
        }
      }
    );
  }, [directionsService, directionsRenderer, origin, destination, travelMode]);

  // The DirectionsRenderer is implicitly handling the display via `directionsRenderer.setMap(map)`
  // and `directionsRenderer.setDirections(result)`, so no direct rendering is needed here 
  // in the modern library approach if the renderer is initialized with `map`.
  // However, older libraries like `@react-google-maps/api` provide a dedicated <DirectionsRenderer /> component.
  
  // You might return UI elements for information here, or simply `null` if the renderer handles everything.
  return null;
};

export default DirectionsComponent;