import { Bot, Users, Zap, FileText, History, Lock } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Work together seamlessly with your team in real-time. See changes as they happen and collaborate effectively with multiple users simultaneously.",
  },
  {
    icon: Bot,
    title: "AI Assistance",
    description:
      "Get intelligent suggestions and assistance while writing. Our AI helps you write better, faster, and more effectively.",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description:
      "Changes sync instantly across all devices and users. Never worry about saving or version conflicts again.",
  },
  {
    icon: FileText,
    title: "Rich Text Editor",
    description:
      "Powerful TipTap editor with support for formatting, tables, lists, and more. Create beautiful documents with ease.",
  },
  {
    icon: History,
    title: "Version History",
    description:
      "Track changes and access previous versions of your documents. Easily revert to earlier versions if needed.",
  },
  {
    icon: Lock,
    title: "Secure Access",
    description:
      "Enterprise-grade security with protected routes and authentication. Keep your documents safe and accessible only to authorized team members.",
  },
];

export default function Features() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
            Everything you need for collaborative document editing
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Powerful features designed to make team collaboration seamless and
            productive
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold">
                  <feature.icon
                    className="text-primary h-5 w-5 flex-none"
                    aria-hidden="true"
                  />
                  {feature.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
