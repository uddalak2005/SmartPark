import React, { useState } from 'react'
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import DirectionsComponent from '../components/maps/DirectionComponent'
import { useEffect } from 'react';
import StableMapDisplay from "../components/maps/sessionMap"
import {useNavigate} from "react-router-dom"

const formatTime = (totalSeconds) => {
    if (totalSeconds < 0) return 'Arrived!';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Pad single digits with a leading zero
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');
    
    // Only show hours if the duration is 1 hour or more
    return hours > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
};

export default function RunningSession() {

    const navigate = useNavigate();
    const [isLoading,setisLoading] = useState(false)
    const journeyDetails = React.useMemo(() => JSON.parse(localStorage.getItem("journeyDetails")), []);
    const initialDurationSeconds = parseInt(journeyDetails?.duration) || 0;
    const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(initialDurationSeconds);

    useEffect(() => {
        if (timeRemainingSeconds <= 0) return;

        const intervalId = setInterval(() => {
            setTimeRemainingSeconds(prevSeconds => {
                if (prevSeconds <= 1) {
                    clearInterval(intervalId);
                    return 0; 
                }
                return prevSeconds - 1;
            });
        }, 1000);
        // Cleanup function to clear the interval when the component unmounts or duration changes
        return () => clearInterval(intervalId);
    }, [journeyDetails?.duration]);

    console.log("RunningSession Component: RENDERED (Timer Update)");

  return (
    <div className='w-[100vw] h-[100vh] flex-col'>
    <div className='h-full relative'>
        <div className='flex-col h-full w-full'>
        <StableMapDisplay journeyDetails={journeyDetails} />
        </div>
        {/* --- Details Panel: Renders Every Second --- */}
                    <div className='absolute bottom-0 z-20 w-full p-4'>
                        <div className='bg-white rounded-t-2xl shadow-2xl p-6 md:p-8 border-t-4 border-green-500'>

                            {/* 1. Origin & Destination Section */}
                            <div className='flex justify-between items-start pb-4 mb-4 border-b border-gray-100'>
                                <div className='flex flex-col flex-1 min-w-0 pr-4'>
                                    <h3 className='text-sm text-gray-500 font-medium tracking-wider uppercase mb-1'>
                                        <span className='mr-1'>🟢</span> Departure from
                                    </h3>
                                    <p className='text-xl text-gray-800 font-semibold truncate'>
                                        {journeyDetails?.origin}
                                    </p>
                                </div>
                                <div className='flex flex-col flex-1 min-w-0 pl-4 border-l border-gray-200'>
                                    <h3 className='text-sm text-gray-500 font-medium tracking-wider uppercase mb-1'>
                                        <span className='mr-1'>📍</span> Destination at
                                    </h3>
                                    <p className='text-xl text-gray-800 font-semibold truncate'>
                                        {journeyDetails?.destination}
                                    </p>
                                </div>
                            </div>

                            {/* 2. ETA & Distance Section (Focused Data Display) */}
                            <div className='grid grid-cols-2 gap-4 mb-6'>
                                {/* LIVE TIMER (ETA) */}
                                <div className='flex flex-col'>
                                    <h4 className='text-xs text-gray-500 font-medium uppercase'>Time Remaining</h4>
                                    <p className={`text-3xl font-extrabold ${timeRemainingSeconds <= 60 ? 'text-red-500 animate-pulse' : 'text-green-600'}`}>
                                        {/* Display the formatted countdown */}
                                        {formatTime(timeRemainingSeconds)} 
                                    </p>
                                </div>

                                {/* Distance */}
                                <div className='flex flex-col text-right'>
                                    <h4 className='text-xs text-gray-500 font-medium uppercase'>Trip Distance</h4>
                                    <p className='text-3xl text-gray-800 font-extrabold'>
                                        {journeyDetails?.distance || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* 3. Action Buttons with Hover Effects */}
                            <div className='flex gap-4'>
                                <button
                                    className='text-red-500 rounded-lg border-2 border-red-500 
                                           text-base font-bold flex-grow p-3 
                                           transition-colors duration-200 
                                           hover:bg-red-50 hover:border-red-600 hover:text-red-600'
                                >
                                    Cancel Booking
                                </button>
                                <button
                                    className='bg-green-500 rounded-lg text-white 
                                           text-base font-bold flex-grow p-3 
                                           shadow-md hover:bg-green-600 
                                           transition-colors duration-200'
                                    onClick={()=>{navigate("/session-manage")}}
                                >
                                    I've Reached
                                </button>
                            </div>
                        </div>
                    </div>
        </div>
    </div>
  )
}
