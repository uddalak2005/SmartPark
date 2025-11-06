import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {auth, googleProvider} from "../../utils/firebaseconfig"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";


interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void;
}

const SignInModal = ({ open, onOpenChange, onSwitchToSignUp }: SignInModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading,setisLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDataToken = async (uid: string) => {
    try {
        const url = `http://localhost:3000/user/login/${uid}`;
        const res = await fetch(url, {
            method: 'POST',
        });
        if (res.ok) {
            const data = await res.json();
            console.log(data);
            localStorage.setItem("userDataId", data.user._id);
        }
    }
    catch (err) {
        console.error(err);
    }
}

  const handleSignIn = async(e: React.FormEvent) => {
    e.preventDefault();
    const user = await signInWithEmailAndPassword(auth,email,password);
    if(user.user){
    const uid = user.user.uid;
    handleDataToken(uid);
    navigate("/dashboard");
    }
    else{
      toast({
        title: "Incorrect credentials!"
      })
    }
  };

  const handleGoogleSignIn = async(e: React.FormEvent) => {
    e.preventDefault();
    try {
      setisLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      if(result.user){
      console.log(result.user);
      handleDataToken(result.user.uid);
      toast({
          title: "Google sign in success!"
        })  
      navigate("/dashboard");
      }
      else{
        toast({
          title: "Google sign in error!"
      })
      }
    } catch (err: any) {
      console.error("Google auth error:", err);
    } finally {
      setisLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSignIn} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me
              </label>
            </div>
            <Button variant="link" className="text-sm px-0">
              Forgot password?
            </Button>
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
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
            onClick={handleGoogleSignIn}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="px-0"
              onClick={() => {
                onOpenChange(false);
                onSwitchToSignUp();
              }}
            >
              Sign up
            </Button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;
