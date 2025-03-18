import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserWelcomeProps {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export function UserWelcome({ user }: UserWelcomeProps) {
  return (
    <Card className="mb-6 ">
      <CardHeader>
        <CardTitle>Welcome back{user.name ? `, ${user.name}` : ""}!</CardTitle>
        <CardDescription>
          Here&apos;s what&apos;s happening with your documents today
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="stats grid gap-4 grid-cols-2 md:grid-cols-3">
          <div className="stat">
            <div className="text-muted-foreground text-sm">
              Active Documents
            </div>
            <div className="text-2xl font-bold">5</div>
          </div>
          <div className="stat">
            <div className="text-muted-foreground text-sm">Collaborators</div>
            <div className="text-2xl font-bold">12</div>
          </div>
          <div className="stat">
            <div className="text-muted-foreground text-sm">AI Assists</div>
            <div className="text-2xl font-bold">24</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
