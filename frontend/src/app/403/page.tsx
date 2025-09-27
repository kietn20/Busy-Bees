export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-6xl font-bold">403</h1>
      <p className="text-xl mt-4">Forbidden</p>
      <p className="mt-2">You do not have access to this resource.</p>
    </div>
  );
}
