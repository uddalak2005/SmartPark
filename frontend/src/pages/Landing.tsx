import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Zap, Shield, TrendingUp, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import SignInModal from "@/components/auth/SignInModal";
import SignUpModal from "@/components/auth/SignUpModal";
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from "../utils/firebaseconfig"
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    // console.log("User is logged in. UID:", uid);
    navigate("/dashboard");
  } else {
    console.log("No user is signed in.");
    navigate("/auth");
  }
});



  const features = [
    {
      icon: MapPin,
      title: "Smart Slot Booking",
      description: "Reserve your parking spot in advance with real-time availability updates.",
    },
    {
      icon: Zap,
      title: "AI-Powered Optimization",
      description: "Our AI finds the optimal parking zone based on your destination and preferences.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your vehicle and data are protected with industry-leading security measures.",
    },
    {
      icon: TrendingUp,
      title: "Usage Analytics",
      description: "Track your parking patterns, fuel savings, and optimize your daily commute.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar onSignIn={() => setShowSignIn(true)} onSignUp={() => setShowSignUp(true)} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-primary font-medium text-sm">AI-Powered Parking Solution</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Smart Parking Made Simple
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find, book, and optimize your parking experience with our intelligent platform. Save time,
            reduce fuel costs, and park with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg" onClick={() => setShowSignUp(true)}>
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={() => setShowSignIn(true)}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SmartPark?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experience the future of parking with cutting-edge technology and user-friendly features.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow border-border bg-card"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="p-12 text-center bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Park Smarter?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of users who have simplified their parking experience with ParkEase.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg"
              onClick={() => setShowSignUp(true)}
            >
              Create Your Free Account
            </Button>
          </Card>
        </div>
      </section>

      <SignInModal
        open={showSignIn}
        onOpenChange={setShowSignIn}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
      />
      <SignUpModal
        open={showSignUp}
        onOpenChange={setShowSignUp}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
      />
    </div>
  );
};

export default Landing;
