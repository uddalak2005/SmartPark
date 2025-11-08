import React, { useState, useEffect } from 'react';
import {Clock,Ticket,Hash,MapPin} from "lucide-react";
import { DetailItem } from '../loader/detailItems';

const useElapsedTime = (checkInTime) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!checkInTime) return;

        // Convert ISO string (e.g., "2025-11-07T16:15:00") to Date object
        const startTime = new Date(checkInTime).getTime();

        const intervalId = setInterval(() => {
            const now = Date.now();
            const differenceInSeconds = Math.floor((now - startTime) / 1000);
            setElapsedSeconds(differenceInSeconds);
        }, 1000);

        // Calculate initial elapsed time immediately on mount
        const now = Date.now();
        const initialDifference = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(initialDifference > 0 ? initialDifference : 0);


        return () => clearInterval(intervalId);
    }, [checkInTime]);

    // Utility to format seconds into HH:MM:SS
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');
        
        return `${h}:${m}:${s}`;
    };

    return formatTime(elapsedSeconds);
};

// --- BookingStatusCard Component ---
const BookingStatusCard = ({ bookingData, onEndSession }) => {
    
    if (!bookingData) {
        return (
            <div className="text-center p-12 bg-white rounded-2xl shadow-xl max-w-lg mx-auto border-t-4 border-gray-300">
                <p className="text-lg text-gray-600 font-semibold">Preparing your session details...</p>
                {/* Optional: Add a simple spinner or placeholder content here */}
            </div>
        );
    }
    
    const { bookingId, slotId, zoneId, checkInTime, parkingToken } = bookingData;
    const elapsedTime = useElapsedTime(checkInTime);

    const formatCheckIn = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };


    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-lg mx-auto border-t-4 border-blue-500">
            
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2 flex items-center">
                <Ticket className="w-8 h-8 mr-2 text-blue-500" />
                Active Parking Session
            </h2>
            <p className="text-sm text-gray-500 mb-6">Your token is live. Please display it for verification.</p>

            {/* --- Session Timer --- */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex items-center justify-between">
                <div>
                    <span className="text-sm font-medium text-blue-600 uppercase tracking-widest">
                        Elapsed Time
                    </span>
                    <p className="text-5xl font-extrabold text-blue-800 leading-none mt-1">
                        {elapsedTime}
                    </p>
                </div>
                <Clock className="w-10 h-10 text-blue-500 animate-spin-slow" />
            </div>

            {/* --- Key Details Grid --- */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">

                {/* 1. Check-in Time */}
                <DetailItem 
                    icon={Clock} 
                    label="Check-in Time" 
                    value={formatCheckIn(checkInTime)}
                />

                {/* 2. Booking ID */}
                <DetailItem 
                    icon={Hash} 
                    label="Booking ID" 
                    value={bookingId ? bookingId.slice(-6) : 'N/A'} // Show last 6 chars
                />
                
                {/* 3. Slot & Zone */}
                <DetailItem 
                    icon={MapPin} 
                    label="Location" 
                    value={`Zone: ${zoneId.slice(-4)} | Slot: ${slotId}`}
                />
            </div>
            
            {/* --- Action Button --- */}
            <div className="mt-8">
                <button 
                    onClick={onEndSession(elapsedSeconds)}
                    className="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-bold 
                               shadow-md hover:bg-red-700 transition-all"
                >
                    End Session & Pay
                </button>
            </div>
        </div>
    );
};

export default BookingStatusCard;