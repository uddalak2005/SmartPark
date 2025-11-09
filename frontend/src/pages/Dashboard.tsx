import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Navigation, MapPin, AlertCircle, ArrowDown, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {motion} from 'framer-motion';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import Booking from '../components/bookingModals/Booking'
import DirectionsComponent from '../components/maps/DirectionComponent'

const Dashboard = () => {
  interface zoneDetails {
    _id: Number, 
    name: String, 
    distance: String, 
    price: String, 
    available: Number, 
    uid: String
  }

  interface directionRequest {
    origin: string,
    destination: string,
  }

  interface LatLng {
    start_lat : number,
    start_lng : number,
    end_lat: number,
    end_lng : number
  }

  interface directionsResponse {
    origin: string,
    destination: string,
    LatLong : LatLng,
    duration : number,
    distance : string,
    ETA : string
  }

  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [bookingRequestRaised,setbookingRequestRaised] = useState(false);
  const [chosenZone,setchosenZone] = useState<zoneDetails | null>(null);
  const [directionRequest,setdirectionRequest] = useState<directionRequest | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<directionsResponse | null>(null);
  const [nearbyParkingZones,setnearbyParkingZones] = useState(null);
  const [bookingConfirmedLoader,setbookingConfirmedLoader] = useState(false);
  const [isPriority,setIsPriority] = useState(false);
  const [likelihood,setlikelihood] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  function convertTimeToISO(timeStr: string) {
  const now = new Date(); // today's date

  // match "HH:MM AM" or "HH:MMAM" — flexible spacing and case
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error(`Invalid time format: ${timeStr}`);

  let [_, hh, mm, modifier] = match;
  let hours = parseInt(hh, 10);
  const minutes = parseInt(mm, 10);

  // Convert 12-hour time → 24-hour
  if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

  const dateWithTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  return dateWithTime.toISOString();
}

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (departure && destination) {
      console.log("Origin: ", departure, "Destination: ", destination);
      
      setdirectionRequest(
        {
          origin:departure,
          destination:destination
        })

      setShowResults(true);

      toast({
        title: "Searching for parking zones",
        description: "Finding optimal parking locations...",
      });
    }
  };

  const getLikelihood = async () => {
    const API_URL = "https://agentsay-volkswagen.hf.space/infer";

    if (!destination) {
        console.error("Destination is required for likelihood calculation.");
        return;
    }
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ target_place : "Alipore" }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setlikelihood(data.congestion_level);  
        console.log("Likelihood data received:", data.congestion_level);
    } catch (error) {
        // Handle network errors or issues with the fetch/response
        console.error("Error fetching likelihood:", error);
        setlikelihood("Unknown"); 
    }
  }

  const getNearbyParkings = async(LatLng : LatLng) => {
    try {
      setbookingConfirmedLoader(true);
      const url = `${import.meta.env.VITE_LOCAL_BACKEND_URL}/parking/getNearby?lat=${LatLng.end_lat}&lon=${LatLng.end_lng}`
      const res = await fetch(url,{method: 'GET'});
      if(res.ok){
        const data = await res.json();
        console.log(data);
        const done = await getLikelihood();
        setnearbyParkingZones(data.data);
        }
        setbookingConfirmedLoader(false);
    } catch (error) {
      console.log(error);
    }
  }

useEffect(() => {
    if (!directionRequest || !window.google) {
        return;  
    }
    const { origin, destination } = directionRequest;
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING, // or BICYCLING, WALKING, TRANSIT
        },
        (response, status) => {
            if (status === 'OK') {

                const route = response.routes[0];
                const leg = route.legs[0];

                const durationValue = leg.duration.value;
                const distance = leg.distance.text;
                const endLocation = response.routes[0].legs[0].end_location;
                const startLocation = response.routes[0].legs[0].start_location;
                
                const endLocationLatitude = endLocation.lat();
                const endLocationLongitude = endLocation.lng();
                const startLocationLatitude = startLocation.lat();
                const startLocationLongitude = startLocation.lng();

                const LatlngObj = {
                  start_lat : startLocationLatitude,
                  start_lng : startLocationLongitude,
                  end_lat : endLocationLatitude,
                  end_lng : endLocationLongitude
                }

                getNearbyParkings(LatlngObj);
                const eta = calculateETA(durationValue)
                const curatedDirectionResponse = {
                  origin: directionRequest.origin,
                  destination : directionRequest.destination,
                  LatLong : {
                  start_lat : startLocationLatitude,
                  start_lng : startLocationLongitude,
                  end_lat : endLocationLatitude,
                  end_lng : endLocationLongitude
                },
                  duration : durationValue,
                  distance : distance,
                  ETA : eta
                }

                setDirectionsResponse(curatedDirectionResponse);
                console.log(response);
            } else {
                console.error('Directions request failed:', status);
                setDirectionsResponse(null);
            }
        }
    );
}, [directionRequest]);

  const calculateETA = (durationInSeconds: number): string => {
    const now = new Date().getTime();

    const durationInMilliseconds = durationInSeconds * 1000;

    const etaTime = new Date(now + durationInMilliseconds);
    const options: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true, // Use 12-hour format with AM/PM
    };

    const formattedETA = etaTime.toLocaleTimeString('en-US', options);
    return formattedETA;
};

  const handleSlotBooking = async(zoneDetails : zoneDetails) => {
    try {
        
        const payload = {
            userId: localStorage.getItem("userDataId"),
            zoneId: zoneDetails._id,
            departureLocation: { 
              lat: directionsResponse.LatLong.start_lat ,
              lon: directionsResponse.LatLong.start_lng 
            },
            destinationLocation: { 
              lat: directionsResponse.LatLong.end_lat ,
              lon: directionsResponse.LatLong.end_lng 
            },
            ETA: convertTimeToISO(directionsResponse.ETA),
          };

        console.log(payload);

        const url = `${import.meta.env.VITE_LOCAL_BACKEND_URL}/booking/bookSlot`;
        const res = await fetch(url,{
          method : 'POST',
          headers: {
            "Content-Type": "application/json",  // 👈 this line is essential
          },
          body:JSON.stringify(payload)
        });
        if(res.ok){
          const data = await res.json()
          console.log(data);
          localStorage.setItem("bookingToken",data.data.bookingToken);
        }
    } catch (error) {
        console.log(error);
    }
    console.log("Booking done!");
    localStorage.setItem("journeyDetails",JSON.stringify(directionsResponse));
    navigate("/session");
  }

  return (
    <DashboardLayout>

      <div className="max-w-full h-full mx-auto">
        {/* Map Placeholder */}
        <Card className="relative p-4 h-[100%] 
        bg-gradient-to-br from-secondary/50 
        to-background border-border 
        flex justify-center">
          
      {bookingRequestRaised &&
      <div className="absolute top-0 h-full w-full bg-black/50 z-30"></div>}

          <div className="absolute w-full h-full top-0 text-center text-muted-foreground">
              <Map
                  defaultZoom={13}
                  defaultCenter={ { lat: 22.5744, lng: 88.3629} }
              >
                {directionRequest &&
                <DirectionsComponent 
                  origin={directionRequest.origin} 
                  destination={directionRequest.destination}
                />
                }

              </Map>
          </div>

          {/* Search Form */}
        <Card className={`absolute p-6 bottom-0 left-0 right-0 transition-all 
          ${showResults ? "hidden" : ""}`}>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure">Departure Location</Label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="departure"
                    placeholder="Enter starting point"
                    className="pl-10"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="destination"
                    placeholder="Enter destination"
                    className="pl-10"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Search for Zones
            </Button>
          </form>
        </Card>

        {/* Results */}
        {showResults && (
        <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        // Main container styles: Fixed width/position, elevated, rounded top
        // Added 'relative' here to ensure the absolute-positioned loader covers it
        className="absolute bottom-0 w-full p-4 pt-0 bg-white shadow-2xl z-40 
                   rounded-t-3xl max-h-[90vh] overflow-auto" // 🚨 Added 'relative'
        >

        {/* 🚨 NEW: Full-Screen Loader Overlay */}
        {bookingConfirmedLoader && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center 
                            bg-white bg-opacity-90 backdrop-blur-sm rounded-t-3xl">
                
                {/* Loader Spinner (You can replace this with a custom SVG or component) */}
                <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" viewBox="0 0 24 24">
                    <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                    />
                    <path 
                        className="opacity-75" 
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>

                <p className="text-lg font-semibold text-gray-800">
                    Fetching best slots for you...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    Please wait, this may take a moment.
                </p>
            </div>
        )}
        
        {/* --- Header and Close Button --- */}
        <div className="sticky top-0 bg-white pt-4 pb-4 mb-4 z-50">
            <div className="h-1 w-12 bg-gray-300 rounded-full mx-auto mb-4" /> 
            <div className="absolute top-4 right-4 flex items-center gap-3">
                <div className="cursor-pointer p-2 bg-gray-100 
                             hover:bg-gray-200 transition-colors duration-200 rounded-full"
                    onClick={() => setShowResults(false)}>
                    {/* Assuming ArrowDown is imported */}
                    <ArrowDown className="h-5 w-5 text-gray-700" /> 
                </div>
            </div>

            {/* --- Trip Summary Stats --- */}
            <div className="flex gap-4 justify-start pr-16 border-b border-gray-100 pb-4">
                <div className="flex flex-col">
                    <h2 className="text-sm text-gray-500 font-medium uppercase tracking-wider">Distance</h2>
                    <strong className="text-2xl font-bold text-gray-900">
                        {directionsResponse ? directionsResponse.distance : "---"}
                    </strong>
                </div>

                <div className="flex flex-col">
                    <h2 className="text-sm text-gray-500 font-medium uppercase tracking-wider">ETA</h2>
                    <strong className="text-2xl font-bold text-green-600">
                        {directionsResponse ? directionsResponse.ETA : "---"}
                    </strong>
                </div>
            </div>

            <div className="flex justify-end items-center space-x-4 pr-4 mt-4">
                    <span className="text-sm pl-2 font-medium text-gray-700">Priority parking</span>
                    <button
                        onClick={() => setIsPriority(!isPriority)} // Assuming setIsPriority is available
                        className={`px-3 py-1 text-xs rounded-full transition-colors duration-300 font-semibold
                            ${isPriority 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {isPriority ? 'ON' : 'OFF'}
                    </button>
              </div>
        </div>

        {/* --- Parking Zones List --- */}
        <div className="space-y-2">
            
            <h3 className="text-xl font-bold text-gray-800 pl-2 mb-1">
                AI-Filtered Zones
            </h3>
            <p className="text-sm text-gray-500 mb-4 pl-2">
                Likelihood: <strong className="text-gray-700">{likelihood || "N/A"}</strong>
            </p>
            
            {/* Use the actual state variable (nearbyParkingZones) */}
            {nearbyParkingZones && nearbyParkingZones.length > 0 ? (
                nearbyParkingZones.map((zone : any) => (
                    <Card 
                        // Use the unique _id for the key
                        key={zone._id} 
                        // 🚨 NEW: Dynamic color based on isPriority state
                        className={`p-4 md:p-6 border rounded-xl cursor-pointer 
                                    hover:shadow-lg transition-all duration-300 
                                    ${isPriority ? 'border-amber-400 bg-amber-100' : 'border-gray-100 bg-white'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0 pr-4">
                                
                                {/* ZONE TITLE */}
                                <h4 className="text-xl font-bold text-gray-800 mb-1 truncate">
                                    {zone.title}
                                </h4>
                                
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                                    
                                    {/* 1. DISTANCE (Rounded and converted from meters to km if > 1000m) */}
                                    <div className="flex items-center">
                                        <span className="text-base text-gray-700 font-semibold">
                                            {/* Logic to display in km or m */}
                                            {zone.distance > 1000 
                                                ? `${(zone.distance / 1000).toFixed(1)} km` 
                                                : `${Math.round(zone.distance)} m`}
                                        </span>
                                        <span className="ml-1">away</span>
                                    </div>
                                    
                                </div>
                                
                                {/* 4. CAPACITY and AVAILABLE SLOTS (Highlighted Row) */}
                                <div className="mt-2 flex items-center gap-4 text-sm font-medium">
                                    <span className="text-gray-600">
                                        Capacity: <strong>{zone.capacity}</strong>
                                    </span>
                                    
                                    <span className="text-gray-600">
                                        Available: 
                                        <span className={`ml-1 font-bold ${zone.availableSlots > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {zone.availableSlots}
                                        </span>
                                    </span>
                                </div>

                            </div>
                            
                            {/* Book Now Button */}
                            <Button 
                                className="bg-green-600 text-white px-6 py-2 rounded-lg 
                                           font-semibold hover:bg-green-700 transition-colors"
                                onClick={() => {
                                    setbookingRequestRaised(true);
                                    setchosenZone(zone);
                                    // You would likely set bookingConfirmedLoader(true) here as well
                                }}
                                // Disable button if no slots are available
                                disabled={zone.availableSlots <= 0}
                            >
                                {zone.availableSlots > 0 ? 'Book Now' : 'Full'}
                            </Button>
                        </div>
                    </Card>
                ))
            ) : (
                // Fallback for when data is loading or empty
                <div className="text-center py-8 text-gray-500">
                    No nearby parking zones found.
                </div>
            )}
        </div>
    </motion.div>
)}
          {/* Booking confirmation and time */}
          {chosenZone && 
          <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="absolute bottom-0 z-50 max-h-[100%] overflow-auto w-full p-2 pt-4 bg-white">
              
              <Booking zoneDetails={chosenZone} onConfirmBooking={(zoneDetails : zoneDetails) => {
                  setbookingRequestRaised(!bookingRequestRaised);
                  handleSlotBooking(zoneDetails)
              }}/>

          </motion.div>
          }
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
