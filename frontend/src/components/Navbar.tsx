import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { Link } from "react-router-dom";

interface NavbarProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

const Navbar = ({ onSignIn, onSignUp }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">SmartPark</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onSignIn}>
            Sign In
          </Button>
          <Button onClick={onSignUp}>Sign Up</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
