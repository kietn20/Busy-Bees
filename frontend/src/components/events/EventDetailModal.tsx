'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/context/AuthContext';
import { updateEvent } from '@/services/eventApi';
import { Event } from '@/services/groupApi';

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
      onClose();
    } catch (error) {
      console.error("Failed to update event", error);
    } finally {
      setIsSaving(false);
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
            <div><Label htmlFor="edit-title">Title</Label><Input id="edit-title" value={title} onChange={e => setTitle(e.target.value)} /></div>
            <div><Label htmlFor="edit-startTime">Start Time</Label><Input id="edit-startTime" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
            <div><Label htmlFor="edit-description">Description</Label><Textarea id="edit-description" value={description} onChange={e => setDescription(e.target.value)} /></div>
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


        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}