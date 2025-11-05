"use client";

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getGroupById, updateCourseGroup } from '@/services/groupApi';
import GroupMembersList from './group-members-list';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type InitialGroupShape = {
  id?: string;
  groupName?: string;
  description?: string;
  owner?: string;
};

interface Props {
  groupId?: string;
  initialGroup?: InitialGroupShape;
  onSaved?: (group: any) => void;
}

export default function EditGroupForm({ groupId, initialGroup, onSaved }: Props) {
  const [group, setGroup] = useState<InitialGroupShape | null>(initialGroup || null);
  const [name, setName] = useState(initialGroup?.groupName || '');
  const [description, setDescription] = useState(initialGroup?.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState<boolean>(!!groupId && !initialGroup);

  const router = useRouter();
  const ERROR_TOAST_ID = "edit-group-error";
  const MAX_GROUP_NAME_LENGTH = 40;

  useEffect(() => {
    if (!groupId) return;
    if (initialGroup) return; // already have data
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const g = await getGroupById(groupId);
        if (!mounted) return;
        setGroup({ id: (g as any)._id || undefined, groupName: g.groupName, description: g.description, owner: (g as any).ownerId });
        setName(g.groupName || '');
        setDescription(g.description || '');
      } catch (err) {
        console.error('Failed to load group for edit form', err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [groupId, initialGroup]);

  const hasChanges = name !== (group?.groupName || '') || description !== (group?.description || '');

  const handleRevert = () => {
    setName(group?.groupName || '');
    setDescription(group?.description || '');
  };

  const handleSave = async () => {
    if (!name || name.trim() === "") {
      toast.error("Group name is required."); 
      return;
    }
    if (name.length > MAX_GROUP_NAME_LENGTH) {
      toast.error(`Group name must be ${MAX_GROUP_NAME_LENGTH} characters or fewer.`);
      return;
    }
    if (!groupId && !group?.id) {
      toast.error('No group id available to save.', { id: ERROR_TOAST_ID });
      return;
    }
    setIsSaving(true);
    try {
      const idToUse = groupId || group!.id!;
      const res = await updateCourseGroup(idToUse, { groupName: name.trim(), description: description.trim() });
      if (res?.data?.group) {
        const updated = res.data.group;
        setGroup({ id: updated._id, groupName: updated.groupName, description: updated.description });
        setName(updated.groupName || '');
        setDescription(updated.description || '');
        if (onSaved) onSaved(updated);
        toast.success("Group updated successfully!");
        router.refresh();
      }
    } catch (err) {
      toast.error('Failed to save changes.', { id: ERROR_TOAST_ID });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Loading group...</div>;

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">Profile</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <div className="flex flex-col">
          <div className="space-y-2 mx-4 my-2 py-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={MAX_GROUP_NAME_LENGTH} className="bg-white border-gray-300 focus:border-blue-500" />
          </div>

          <div className="space-y-2 mx-4 my-2 py-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <Input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-white border-gray-300 focus:border-blue-500" />
          </div>
        </div>

        {/* Save/Revert buttons - only show when there are changes */}
        {hasChanges && (
          <div className="flex justify-end gap-3 mx-4 mt-4">
            <Button type="button" variant="outline" onClick={handleRevert} className="px-4" disabled={isSaving}>Revert</Button>
            <Button type="submit" className="px-4" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        )}
      </form>
      {/* Group members list */}
      {(groupId || group?.id) && (
        <div className="mt-8 border-t pt-6">
          <GroupMembersList groupId={groupId || group?.id || ''} />
        </div>
      )}


    </div>
  );
}
