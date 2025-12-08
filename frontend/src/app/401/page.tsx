export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-accent/40">
      <h1 className="text-6xl font-bold">401</h1>
      <p className="text-xl mt-4">Unauthorized Access</p>
      <p className="mt-2">You do not have permission to view this page.</p>
    </div>
  );
}
