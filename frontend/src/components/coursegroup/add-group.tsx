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

const AddGroup = () => {
  const [isCreateMode, setIsCreateMode] = useState(true);

  const toggleMode = () => {
    setIsCreateMode(!isCreateMode);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Group</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
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
            />
          </div>

          <Button
            type="button"
            className="px-8 py-2 rounded-lg font-medium w-1/2"
          >
            {isCreateMode ? "Create" : "Join"}
          </Button>

          <div className="border-t border-gray-300 w-full max-w-sm"></div>

          <div className="text-center">
            <span className="text-sm">
              {isCreateMode ? "Already have a group? " : "Don't have a group? "}
            </span>
            <button
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              onClick={toggleMode}
            >
              {isCreateMode ? "Join Group" : "Create Group"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroup;
