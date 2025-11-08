import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Navigation, MapPin, ArrowDown } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
import { motion } from "framer-motion";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import Booking from "../components/bookingModals/Booking";
import DirectionsComponent from "../components/maps/DirectionComponent";
import axios from "axios";
=======
import {motion} from 'framer-motion';
import {Map} from '@vis.gl/react-google-maps';
import Booking from '../components/bookingModals/Booking'
import DirectionsComponent from '../components/maps/DirectionComponent'
>>>>>>> Stashed changes

const Dashboard = () => {
  interface zoneDetails {
    id: number;
    name: string;
    distance: string;
    price: string;
    available: number;
    uid: string;
  }

  interface directionRequest {
    origin: string;
    destination: string;
  }

  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [bookingRequestRaised, setbookingRequestRaised] = useState(false);
  const [chosenZone, setchosenZone] = useState<zoneDetails | null>(null);
  const [directionRequest, setdirectionRequest] =
    useState<directionRequest | null>(null);
  const [expectedDuration, setExpectedDuration] = useState<number | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<any>(null);
  const [ETA, setETA] = useState("");
  const [bookingConfirmedLoader, setbookingConfirmedLoader] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  function convertTimeToISO(timeStr: string) {
    const now = new Date();

    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) throw new Error(`Invalid time format: ${timeStr}`);

    let [_, hh, mm, modifier] = match;
    let hours = parseInt(hh, 10);
    const minutes = parseInt(mm, 10);

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

      setdirectionRequest({
        origin: departure,
        destination: destination,
      });

      setShowResults(true);

      toast({
        title: "Searching for parking zones",
        description: "Finding optimal parking locations...",
      });
    }
  };

  useEffect(() => {
    if (!directionRequest || !window.google) return;

    const { origin, destination } = directionRequest;
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          const route = response.routes[0];
          const leg = route.legs[0];
          const durationValue = leg.duration.value;

          setExpectedDuration(durationValue);
          console.log("Duration:", durationValue, "seconds");

          const eta = calculateETA(durationValue);
          setETA(eta);
          setDirectionsResponse(response);
        } else {
          console.error("Directions request failed:", status);
          setDirectionsResponse(null);
          setExpectedDuration(null);
        }
      }
    );
  }, [directionRequest]);

  const calculateETA = (durationInSeconds: number): string => {
    const now = new Date().getTime();
    const durationInMilliseconds = durationInSeconds * 1000;
    const etaTime = new Date(now + durationInMilliseconds);

    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const formattedETA = etaTime.toLocaleTimeString("en-US", options);
    setETA(formattedETA);
    return formattedETA;
  };

  const handleSlotBooking = async (zoneDetails: zoneDetails) => {
    try {
      setbookingConfirmedLoader(true);

      const payload = {
        userId: localStorage.getItem("userDataId"),
        zoneId: zoneDetails.uid,
        departureLocation: {
          lat: directionsResponse?.routes[0]?.legs[0]?.start_location?.lat(),
          lon: directionsResponse?.routes[0]?.legs[0]?.start_location?.lng(),
        },
        destinationLocation: {
          lat: directionsResponse?.routes[0]?.legs[0]?.end_location?.lat(),
          lon: directionsResponse?.routes[0]?.legs[0]?.end_location?.lng(),
        },
        ETA: convertTimeToISO(ETA),
      };

      console.log(payload);

      const url = `${import.meta.env.VITE_LOCAL_BACKEND_URL}/booking/bookSlot`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data);
        localStorage.setItem("bookingToken", data.data.bookingToken);
        setbookingConfirmedLoader(false);
      }

      navigate("/session");
    } catch (error) {
      console.log(error);
      setbookingConfirmedLoader(false);
    }
  };

  const mockZones = [
    {
      id: 1,
      name: "Central Plaza Parking",
      distance: "0.2 mi",
      price: "$5/hr",
      available: 12,
      uid: "20250012654",
    },
    {
      id: 2,
      name: "Metro Station Parking",
      distance: "0.4 mi",
      price: "$4/hr",
      available: 8,
      uid: "20250012697",
    },
    {
      id: 3,
      name: "Park & Ride Hub",
      distance: "0.6 mi",
      price: "$3/hr",
      available: 25,
      uid: "20250012662",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-full h-full mx-auto">
        <Card className="relative p-4 h-[100%] bg-gradient-to-br from-secondary/50 to-background border-border flex justify-center">
          {bookingRequestRaised && (
            <div className="absolute top-0 h-full w-full bg-black/50 z-30"></div>
          )}

          <div className="absolute w-full h-full top-0 text-center text-muted-foreground">
            <Map
              defaultZoom={13}
              defaultCenter={{ lat: 22.5744, lng: 88.3629 }}
            >
              {directionRequest && (
                <DirectionsComponent
                  origin={directionRequest.origin}
                  destination={directionRequest.destination}
                />
<<<<<<< Updated upstream
              )}
            </Map>
=======
                }
              </Map>
>>>>>>> Stashed changes
          </div>

          {!showResults && (
            <Card className="absolute p-6 bottom-0 left-0 right-0 transition-all">
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
          )}

          {showResults && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="absolute bottom-0 max-h-[100%] overflow-auto w-full p-2 pt-8 bg-white"
            >
              <div
                className="flex justify-center items-center absolute top-6 right-6 cursor-pointer bg-gray-300 rounded-full p-2"
                onClick={() => setShowResults(false)}
              >
                <ArrowDown className="h-6 w-6 mx-auto text-black" />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold ml-2">
                  Expected arrival time:{" "}
                  <strong>{ETA ? ETA : "18:22"}</strong>
                </h2>
                <h3 className="text-xl font-semibold ml-2">
                  Available Parking Zones
                </h3>
                {mockZones.map((zone) => (
                  <Card
                    key={zone.id}
                    className="p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2">
                          {zone.name}
                        </h4>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{zone.distance} away</span>
                          <span>•</span>
                          <span>{zone.price}</span>
                          <span>•</span>
                          <span className="text-primary">
                            {zone.available} spots available
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setbookingRequestRaised(true);
                          setchosenZone(zone);
                        }}
                      >
                        Book Now
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {chosenZone && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="absolute bottom-0 z-50 max-h-[100%] overflow-auto w-full p-2 pt-4 bg-white"
            >
              <Booking
                zoneDetails={chosenZone}
                onConfirmBooking={(zoneDetails: zoneDetails) => {
                  setbookingRequestRaised(!bookingRequestRaised);
                  handleSlotBooking(zoneDetails);
                }}
              />
            </motion.div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;