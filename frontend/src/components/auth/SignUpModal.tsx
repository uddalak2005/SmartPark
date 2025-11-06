import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {auth,googleProvider} from "../../utils/firebaseconfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { userInfo } from "os";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn: () => void;
}

const SignUpModal = ({ open, onOpenChange, onSwitchToSignIn }: SignUpModalProps) => {
  const [step, setStep] = useState(1);
  const [loading,setLoading] = useState(false);
  const [googlesigninsuccess,setgooglesigninsuccess] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    phone: "",
    vehicleType: "",
    carBrand: "",
    carModel: "",
    vehiclePhoto: null,
    carColor: "",
    plateNumber: "",
    password: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (file : any) => {
    setFormData((prevData) => ({
      ...prevData,
      vehiclePhoto: file,
    }));
    console.log("File selected:", file ? file.name : "None");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const backendDataStore = async() => {
    
    const payload = {
      userId: formData.userId,
      email: formData.email,
      name: formData.name,
      phone: formData.phone,
      vehicleType: formData.vehicleType,
      brand: formData.carBrand,
      vehiclePhoto: formData.vehiclePhoto,
      plateNumber: formData.plateNumber,
      password: formData.password,
    };

    console.log(payload)

    const formDataToSend = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "vehiclePhoto") {
        formDataToSend.append("vehiclePhoto", value as File);
      } else {
        formDataToSend.append(key, value as string);
      }
    });
    try{
    console.log(Object.fromEntries(formDataToSend.entries()));

    const response = await fetch(`http://localhost:3000/user/register`,{
      method: 'POST',
      body:formDataToSend
    })
    if(response.ok){
      toast({
        title:"Account created succesfully!"
          })
        }
        const data = response.json();
        console.log(data);
      }
    catch(err){
      console.log(err)
    }
  };

  const handleSignup = async(email : string,password : string) => {
    const user = await createUserWithEmailAndPassword(auth,email,password)
    if(user.user){
      return user.user.uid;
    }
    else{
      console.log("Error signing up");
    }
  };

  const handleNext = async(e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } 
    else {
      if(googlesigninsuccess){
        backendDataStore()
      }
      else{
        const userId = await handleSignup(formData.email,formData.password);
        formData.userId = userId;
        backendDataStore();
      }
      onOpenChange(false);
      navigate("/dashboard");
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if(result.user){
      console.log(result.user);
      formData.userId = result.user.uid;
      formData.email = result.user.email || "";
      formData.name = result.user.displayName || ""
      setgooglesigninsuccess(true);
      }
      else{
        toast({
          title: "Google sign up error!"
      })
      }
      //   navigate("/");
    } catch (err: any) {
      console.error("Google auth error:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Create Account</DialogTitle>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={handleNext} className="space-y-4 mt-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => handleInputChange("vehicleType", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="bike">Bike</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="carBrand">Brand</Label>
                <Select
                  value={formData.carBrand}
                  onValueChange={(value) => handleInputChange("carBrand", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toyota">Toyota</SelectItem>
                    <SelectItem value="honda">Honda</SelectItem>
                    <SelectItem value="ford">Ford</SelectItem>
                    <SelectItem value="tesla">Tesla</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="carModel">Model</Label>
                <Input
                  id="carModel"
                  placeholder="Camry, Civic, etc."
                  value={formData.carModel}
                  onChange={(e) => handleInputChange("carModel", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carColor">Color</Label>
                <Select
                  value={formData.carColor}
                  onValueChange={(value) => handleInputChange("carColor", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            <div className="space-y-2">
            <Label 
              htmlFor="carPhoto" 
              className="
                flex flex-col items-center justify-center 
                w-full h-32 p-4 
                border-2 border-dashed border-gray-300 rounded-lg 
                cursor-pointer bg-gray-50 
                hover:bg-gray-100 hover:border-blue-500 
                transition-all duration-200"
            >
              Vehicle image
              {/* Icon (using a placeholder for a photo/upload icon) */}
              <Camera className="w-8 h-8 text-gray-400 mb-1" /> 
              
              {/* Dynamic Text Display */}
              {/* You should replace the entire div below with the actual file name 
                  if formData.carPhoto is set, otherwise show the default text */}
              <div className="text-sm text-gray-500 text-center">
                <span className="font-semibold text-blue-600">
                  Click to upload
                </span> 
                <span> or drag and drop</span>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, GIF (Max 10MB)
                </p>
              </div>
            </Label>

            {/* Hidden actual file input */}
            <input
              id="carPhoto"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={(e) => handleFileChange(e.target.files[0])} 
              className="hidden" // Hides the default input element
              required
            />
            
            {/* Display file name if a file is selected (optional, but good UX) */}
            {formData.vehiclePhoto && (
                <p className="w-60 text-sm text-green-600 truncate">
                    File selected: **{formData.vehiclePhoto.name}**
                </p>
            )}
          </div>
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input
                  id="plateNumber"
                  placeholder="ABC-1234"
                  value={formData.plateNumber}
                  onChange={(e) => handleInputChange("plateNumber", e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
            {googlesigninsuccess ?
            <div className="flex-col items-center justify-center">
                <h2 className="text-lg text-black">
                  Google Sign up success!
                </h2>
                <p className="text-sm text-gray-400">
                  Proceed to {' '}<strong>Create Account</strong>{' '} to create your account 
                </p>
            </div>
               :
               <div>
            <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="normal"
                  placeholder="your@email.com"
                  value={formData.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignup}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>
            </div>
          }
          </>
            )}

          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}

            <Button type="submit" className="flex-1">
              {step === 3 ? "Create Account" : "Next"}
            </Button>
          </div>

          {step === 1 && (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="px-0"
                onClick={() => {
                  onOpenChange(false);
                  onSwitchToSignIn();
                }}
              >
                Sign in
              </Button>
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignUpModal;