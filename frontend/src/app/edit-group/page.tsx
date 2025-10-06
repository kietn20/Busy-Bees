"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/ProtectedRoute";
import DeleteModal from "@/components/coursegroup/delete-modal";
import { useState } from "react";

export default function GroupSettings() {
  // Dummy group data
  const group = {
    id: "1",
    name: "CECS 329 Study Group",
    description: "Computer Theory and Algorithms study group for Fall 2024",
    owner: "john.doe@example.com",
    createdAt: "2024-09-15",
    memberCount: 8,
    inviteCode: "CECS329-2024",
  };

  // State for editable fields
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);

  // Check if there are unsaved changes
  const hasChanges = name !== group.name || description !== group.description;

  // Handle save changes
  const handleSave = () => {
    // TODO: Implement API call to save changes
    console.log("Saving changes:", { name, description });
  };

  // Handle revert changes
  const handleRevert = () => {
    setName(group.name);
    setDescription(group.description);
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <h1 className="text-xl font-bold text-gray-800 mb-4">Settings</h1>

      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">
          Profile
        </h2>
        <div className="flex flex-col">
          <div className="space-y-2 mx-4 my-2 py-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-gray-300 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2 mx-4 my-2 py-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Save/Revert buttons - only show when there are changes */}
        {hasChanges && (
          <div className="flex justify-end gap-3 mx-4 mt-4">
            <Button variant="outline" onClick={handleRevert} className="px-4">
              Revert
            </Button>
            <Button onClick={handleSave} className="px-4">
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">
          Security
        </h2>

        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2 mb-4 w-full mx-4">
              <label
                htmlFor="owner"
                className="block text-sm font-medium text-gray-700"
              >
                Owner
              </label>
              <Input
                id="owner"
                type="text"
                value={group?.owner || ""}
                disabled
                className="bg-gray-50 w-3/4"
              />
            </div>

            <Button variant="outline" className="w-full sm:w-auto mt-2 w-1/4">
              Change Owner
            </Button>
          </div>
          <div className="flex justify-between items-center w-full py-4">
            <div className="space-y-1 mx-4">
              <h4 className="font-medium text-gray-800">Delete Group</h4>
              <p className="text-sm text-gray-600">
                Permanently delete the group and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <DeleteModal />
          </div>
        </div>
      </div>
    </div>
  );
}
