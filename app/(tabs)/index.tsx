import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Lock, Mail, User, BookOpen, ArrowLeft } from "lucid-react";

interface AuthData {
  email: string;
  password: string;
  name?: string;
}

interface AccountDetails {
  avatar: string;
  grade: string;
  subject: string;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [showAccountSetup, setShowAccountSetup] = useState(false);
  const [loginData, setLoginData] = useState<AuthData>({
    email: "",
    password: "",
  });
  const [signupData, setSignupData] = useState<AuthData>({
    email: "",
    password: "",
    name: "",
  });
  const [accountDetails, setAccountDetails] = useState<AccountDetails>({
    avatar: "default",
    grade: "",
    subject: "",
  });

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    const storedUserName = localStorage.getItem("userName");
    if (authStatus === "true" && storedUserName) {
      setIsAuthenticated(true);
      setUserName(storedUserName);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would validate credentials
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", loginData.email);
    localStorage.setItem("userName", "User");
    router.push("(tabs)/index");
  };

  const handleInitialSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAccountSetup(true);
  };

  const handleFinalSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send all signup data to backend
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", signupData.email);
    localStorage.setItem("userName", signupData.name || "");
    localStorage.setItem("userGrade", accountDetails.grade);
    localStorage.setItem("userSubject", accountDetails.subject);
    router.push("(tabs)/index");
  };

  const Logo = () => (
    <div className="mb-6 flex items-center justify-center">
      <div className="relative h-24 w-24">
        <BookOpen className="h-full w-full text-blue-600" />
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
            onClick={() => router.push("(tabs)/index")}
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

  if (showAccountSetup) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
        <Logo />
        <GameTitle />
        <Card className="w-full max-w-md p-6">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => setShowAccountSetup(false)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h2 className="mb-6 text-2xl font-bold">Complete Your Profile</h2>
          <form onSubmit={handleFinalSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Avatar</label>
              <div className="grid grid-cols-4 gap-2">
                {["1", "2", "3", "4"].map((avatar) => (
                  <Button
                    key={avatar}
                    type="button"
                    variant={accountDetails.avatar === avatar ? "default" : "outline"}
                    className="h-16 w-16"
                    onClick={() => setAccountDetails({...accountDetails, avatar})}
                  >
                    {avatar}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Grade Level</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                value={accountDetails.grade}
                onChange={(e) => setAccountDetails({...accountDetails, grade: e.target.value})}
                required
              >
                <option value="">Select Grade</option>
                <option value="6">6th Grade</option>
                <option value="7">7th Grade</option>
                <option value="8">8th Grade</option>
                <option value="9">High School</option>
                <option value="10">College</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Favorite Subject</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                value={accountDetails.subject}
                onChange={(e) => setAccountDetails({...accountDetails, subject: e.target.value})}
                required
              >
                <option value="">Select Subject</option>
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
                <option value="technology">Technology</option>
                <option value="engineering">Engineering</option>
              </select>
            </div>
            <Button type="submit" className="w-full">
              Complete Setup & Start Playing
            </Button>
          </form>
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
            <form onSubmit={handleInitialSignup} className="space-y-4">
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
                Continue
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}