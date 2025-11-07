// components/maps/StableMapDisplay.jsx

import React from 'react';
import { Map } from '@vis.gl/react-google-maps';
import DirectionsComponent from './DirectionComponent'; // Assuming DirectionsComponent is in the same directory or adjust path

const StableMapDisplay = React.memo(({ journeyDetails }) => {
    // NOTE: The console.log is here to prove the optimization works.
    console.log("Map Component: RENDERED (Should only happen once)"); 
    
    if (!journeyDetails) return null;

    return (
        <div className='flex-col h-full w-full'>
            <Map
                defaultZoom={13}
                defaultCenter={{ lat: 22.5744, lng: 88.3629 }}
            >
                <DirectionsComponent
                    origin={journeyDetails.origin}
                    destination={journeyDetails.destination}
                />
            </Map>
        </div>
    );
});

export default StableMapDisplay;