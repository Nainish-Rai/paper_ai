import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { FaGithub, FaGoogle } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "../ui/input";

export default function LoginCard() {
  return (
    <Card className="h-full w-full flex flex-col justify-center  border-none shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="font-bold h1 pb-2">Login To Paper</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid w-1/2  gap-4">
        <div className="grid grid-cols-1 gap-3">
          <a className="w-full " href="/login/github">
            <Button
              className="w-full p-7 text-md rounded-full"
              variant="outline"
            >
              <FaGithub className="mr-3 h-5 w-5" />
              Sign in with Github
            </Button>
          </a>
          <a className="w-full " href="/login/google">
            {" "}
            <Button
              className="w-full  rounded-full p-7 text-md"
              variant="outline"
            >
              <FaGoogle className="mr-3 h-5 w-5" />
              Sign in with Google
            </Button>
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            className="p-4 py-6 rounded-lg"
            id="email"
            type="email"
            placeholder="m@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            className="p-4 py-6 rounded-lg"
            id="password"
            type="password"
          />
        </div>
      </CardContent>
      <CardFooter className="w-1/2">
        <Button className="w-full  rounded-full p-7 text-md">
          Create account
        </Button>
      </CardFooter>
    </Card>
  );
}
