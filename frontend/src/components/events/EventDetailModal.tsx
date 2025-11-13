'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/context/AuthContext';
import { updateEvent, deleteEvent } from '@/services/eventApi';
import { Event } from '@/services/groupApi';
import toast from "react-hot-toast"

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  isLoading: boolean;
  groupOwnerId: string | null;
  onEventUpdated: () => void;
}

export default function EventDetailModal({ isOpen, onClose, event, isLoading, groupOwnerId, onEventUpdated }: EventDetailModalProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // states for the edit form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // when the event prop changes, update the form state
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');

      const localDateTime = new Date(event.startTime).toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
      setStartTime(localDateTime);
    }
  }, [event]);

  // Reset edit mode when modal is closed or event changes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  if (!event && !isLoading) return null;

  const canModify = user && event && (user.id === event.createdBy._id || user.id === groupOwnerId);

  const handleSaveChanges = async () => {
    if (!event) return;

    setIsSaving(true);

    try {
      await updateEvent(event._id, {
        title,
        description,
        startTime: new Date(startTime).toISOString(),
      });

      onEventUpdated(); // tell the parent to refresh
      setIsEditing(false);
      toast.success("Changes saved.");
      onClose();
    } catch (error) {
      toast.error("Failed to save changes.");
      console.error("Failed to update event", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setIsDeleting(true);
    try {
      await deleteEvent(event._id);
      onEventUpdated(); // refresh the parent list
      onClose();
      toast.success("Event deleted.");
    } catch (error) {
      toast.error("Failed to delete event.");
      console.error("Failed to delete event", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString: string) => new Date(isoString).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : event?.title}</DialogTitle>
          {!isEditing && <DialogDescription className="pt-2">Hosted by {event?.createdBy.firstName}</DialogDescription>}
        </DialogHeader>
        

        {isEditing ? (
          // --- EDIT MODE ---
          <div className="space-y-4 py-4">
            <div><Label htmlFor="edit-title">Title</Label><Input id="edit-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={50} /></div>
            <div><Label htmlFor="edit-startTime">Start Time</Label>
                <Input id="edit-startTime" type="datetime-local" min="1900-01-01T00:00"
                  max="2099-12-31T23:59" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
            <div><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" value={description} onChange={e => setDescription(e.target.value)} maxLength={150} className="w-[460px]"/></div>
          </div>
        ) : (
          // --- VIEW MODE ---
          <div className="mt-4 space-y-4">
            {isLoading && <p>Loading details...</p>}
            {event && (
              <>
                <p><strong>Start Time:</strong> {formatDate(event.startTime)}</p>
                {event.description && <p><strong>Description:</strong> {event.description}</p>}
              </>
            )}
          </div>
        )}


        <DialogFooter className="sm:justify-between">
          <div>
            {canModify && !isEditing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the event "{event?.title}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? 'Deleting...' : 'Continue'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="flex space-x-2">
            {canModify && (
              isEditing ? (
                <>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
              )
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}