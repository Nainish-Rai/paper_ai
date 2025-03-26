export function LoadingSpinner() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
    </div>
  );
}
