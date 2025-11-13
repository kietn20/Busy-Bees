// File: /frontend/src/components/events/CreateEventModal.tsx

'use client';

import { useState, FormEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createEvent } from '@/services/groupApi'; 
import toast from 'react-hot-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onEventCreated: () => void;
}

export default function CreateEventModal({ isOpen, onClose, groupId, onEventCreated }: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TOAST_ERR_ID = "create-event-error";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!title.trim()) {
      toast.error("Event title is required.", { id: TOAST_ERR_ID });
      setIsLoading(false);
      return;
    }
    
    if (!startTime.trim()) {
      toast.error("Event start time is required.", { id: TOAST_ERR_ID });
      setIsLoading(false); 
      return;
    } 

    if (isNaN(new Date(startTime).getTime())) {
      toast.error("Please enter a valid date and time.", { id: TOAST_ERR_ID });
      setIsLoading(false);
      return;
    }

    // convert local datetime string to ISO 8601 format for the backend    
    const isoStartTime = new Date(startTime).toISOString();

    try {
      await createEvent(groupId, {
        title,
        description,
        startTime: isoStartTime,
      });

      onEventCreated();
      handleClose(); // Use handleClose to reset state and close
      toast.success("Event created.");
    } catch (err: any) {
      toast.error("Failed to create event.", { id: TOAST_ERR_ID });
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to clear form state when closing
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input 
              id="title" value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              maxLength={50}
              //style={{ height: "40px" }} 
              />
              <div className="text-xs text-gray-400 text-right">
                {title.length} / 50
              </div>
          </div>
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              min="1900-01-01T00:00"
              max="2099-12-31T23:59"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              //style={{ height: "40px" }}
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={150}
              placeholder="E.g., Discuss chapters 4-6"
              className="w-[460px]"
              //style={{ height: "70px", overflowY: "auto", resize: "vertical", overflowX: "hidden" }}
            />
            <div className="text-xs text-gray-400 text-right">
              {description.length} / 150
            </div>
          </div>

          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}