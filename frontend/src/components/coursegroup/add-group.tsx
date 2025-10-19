"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { createGroup, joinGroup } from "@/services/groupApi";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

const AddGroup = () => {
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMode = () => {
    setIsCreateMode(!isCreateMode);
    setInputValue("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isCreateMode) {
        // Create group
        const response = await createGroup(inputValue);
        console.log("Group created:", response.data);

        // Close the dialog and redirect to the group page
        setIsOpen(false);
        setInputValue("");
        router.push(`/groups/${response.data.group._id}`);
        router.refresh(); // Refresh to update the group list
      } else {
        // Join group
        const response = await joinGroup(inputValue);
        console.log("Joined group:", response.data);

        // Close the dialog and redirect
        setIsOpen(false);
        setInputValue("");
        router.push(`/groups/${response.data.group._id}`);
        router.refresh();
      }
    } catch (err) {
      console.error("Error:", err);
      let errorMessage = `Failed to ${isCreateMode ? "create" : "join"} group. Please try again.`;

      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Group</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center space-y-6 py-6">
            <DialogHeader className="text-center">
              <DialogTitle className="text-2xl font-bold">
                {isCreateMode ? "Create a Group" : "Join a Group"}
              </DialogTitle>
            </DialogHeader>

            <div className="w-3/4 max-w-sm">
              <Input
                id="group-name"
                placeholder={isCreateMode ? "Group Name" : "Invite Code"}
                className="w-full px-4 py-3 text-center border border-gray-200 rounded-lg"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="px-8 py-2 rounded-lg font-medium w-1/2"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : isCreateMode ? "Create" : "Join"}
            </Button>

            <div className="border-t border-gray-300 w-full max-w-sm"></div>

            <div className="text-center">
              <span className="text-sm">
                {isCreateMode
                  ? "Already have a group? "
                  : "Don't have a group? "}
              </span>
              <button
                type="button"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                onClick={toggleMode}
                disabled={isLoading}
              >
                {isCreateMode ? "Join Group" : "Create Group"}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroup;
