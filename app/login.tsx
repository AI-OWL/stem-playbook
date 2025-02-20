import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Lock, Mail, User, BookOpen } from "lucid-react";

interface AuthData {
  email: string;
  password: string;
  name?: string;
}

export default function WelcomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [loginData, setLoginData] = useState<AuthData>({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState<AuthData>({
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem("isAuthenticated");
    const storedUserName = localStorage.getItem("userName");
    if (authStatus === "true" && storedUserName) {
      setIsAuthenticated(true);
      setUserName(storedUserName);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate against your backend
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", loginData.email);
    localStorage.setItem("userName", "User"); // Replace with actual username
    setUserName("User");
    setIsAuthenticated(true);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send data to your backend
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", signupData.email);
    localStorage.setItem("userName", signupData.name || "");
    setUserName(signupData.name || "");
    setIsAuthenticated(true);
  };

  const Logo = () => (
      <div className="mb-6 flex items-center justify-center">
        <div className="relative h-32 w-32">
          <Image
            src="/assets/images/adaptive-icon.png"
            alt="STEM Playbook Logo"
            layout="fill"
            objectFit="contain"
            priority
          />
      </div>
    </div>
  );

  const GameTitle = () => (
    <div className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-blue-600">STEM Playbook</h1>
    </div>
  );

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <Logo />
        <GameTitle />
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="mb-2 text-2xl font-bold">Welcome back,</h2>
          <p className="mb-6 text-xl text-blue-600">{userName}!</p>
          <Button
            className="w-full bg-blue-800 hover:bg-blue-900"
            size="lg"
            onClick={() => {
              // Handle game start
              console.log("Starting game...");
            }}
          >
            Let's Play
          </Button>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => {
              localStorage.clear();
              setIsAuthenticated(false);
              setUserName("");
            }}
          >
            Logout
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Logo />
      <GameTitle />
      <Card className="w-full max-w-md p-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="pl-10"
                  value={signupData.name}
                  onChange={(e) =>
                    setSignupData({ ...signupData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-10"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}