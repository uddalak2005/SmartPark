import React from 'react'

function Booking({zoneDetails, onConfirmBooking}) {
  return (
    <div className='flex-col h-full w-full bg-white p-6'>
        
        <h1 className='text-black text-lg mb-2'>
        You are booking a slot at zone <strong>{zoneDetails.title}</strong>
        </h1>
        
        <p className='text-gray-400 font-semibold text-sm mb-4'>
            Your ETA has been set according to the map, 
            in case you are unable to reach the booked parked zone within the ETA,
            you will be prompted with further verification for assurance of being on the way, else
            the booked slot shall become unbooked and available to other users.
        </p>

        <button className='bg-green-700 rounded-xl text-white font-bold w-full p-2 mt-8'
        onClick={() => onConfirmBooking(zoneDetails)}>
            Confirm Booking
        </button>
    </div>
  )
}
export default Booking;
