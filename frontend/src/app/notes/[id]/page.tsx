import Editor from "@/components/notes/editor";

export default function NotesPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="w-1/3 my-6 ml-14">
        {/* TODO: Make dynamic */}
        <h1 className="text-3xl font-semibold mb-4">Note Title</h1>
        <div className="grid grid-cols-2 mb-2">
          <h4 className="text-gray-500 ">Created by:</h4>
          {/* TODO: Make dynamic */}
          <span className="">John Doe</span>
        </div>
        <div className="grid grid-cols-2 mb-2">
          <h4 className="text-gray-500">Last modified:</h4>
          {/* TODO: Make dynamic */}
          <span className="">2025-10-27</span>
        </div>
      </div>
      <div className="border-t overflow-hidden py-6 ">
        <div className="h-full">
          <Editor />
        </div>
      </div>
    </div>
  );
}
