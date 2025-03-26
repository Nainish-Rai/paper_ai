type ErrorDisplayProps = {
  message: string;
};

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="w-full h-screen flex items-center justify-center text-red-500">
      <p>{message}</p>
    </div>
  );
}
