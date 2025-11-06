import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, LogOut } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {auth} from "../utils/firebaseconfig"

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock data
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 000-0000",
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    auth.signOut();
    navigate("/");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{userData.name}</h3>
              <p className="text-muted-foreground">{userData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-name"
                  defaultValue={userData.name}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-email"
                  type="email"
                  defaultValue={userData.email}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-phone"
                  type="tel"
                  defaultValue={userData.phone}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-sm text-muted-foreground">Months Active</p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">84</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">$342</p>
              <p className="text-sm text-muted-foreground">Total Savings</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
