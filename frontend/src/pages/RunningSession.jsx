import React, { useState } from 'react'
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import DirectionsComponent from '../components/maps/DirectionComponent'

export default function RunningSession() {
    const [isLoading,setisLoading] = useState(false)
    const journeyDetails = JSON.parse(localStorage.getItem("journeyDetails"));


  return (
    <div className='w-[100vw] h-[100vh] flex-col'>
        <div className='flex-col h-[75vh] w-full'>
        {journeyDetails && 
            <Map
                defaultZoom={13}
                defaultCenter={{ lat: 22.5744, lng: 88.3629}}
            >
                
                {<DirectionsComponent 
                  origin={journeyDetails?.origin}
                  destination={journeyDetails?.destination} 
                />}

            </Map>
        }
        </div>
        <div className='flex-col w-full p-4'>
            <div className='px-6 py-2 w-full flex justify-between mb-2 border-b border-gray-200'>
                <span>
                    <h2 className='text-black text-xl font-semibold mb-2'>Departure from</h2>
                    <p className='text-gray-400 mb-2 text-xl'>{journeyDetails?.origin}</p>
                </span>
                <span>
                    <h2 className='text-black text-xl font-semibold mb-2'>Destination at</h2>
                    <p className='text-gray-400 text-xl mb-2'>{journeyDetails?.destination}</p>
                </span>
            </div>

            <div className='flex px-6 py-2 mb-4'>
                <h1 className='text-green-500 text-xl font-bold'>ETA: {' '}</h1>
                <h1 className='text-gray-400 text-xl font-bold'>{journeyDetails?.ETA}</h1>
            </div>

            <div className='flex gap-4 px-6 py-2 justify-between'>
                <button className='text-green-500 rounded-xl border-2 border-green-500 
                text-sm font-bold flex-grow p-2'>Cancel Booking</button>

                <button className='bg-green-500 rounded-xl text-white 
                text-sm font-bold flex-grow p-2'>I've Reached</button>
            </div>
        </div>
    </div>
  )
}
