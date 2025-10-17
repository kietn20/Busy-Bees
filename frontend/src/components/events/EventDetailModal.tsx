'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Event } from '@/services/groupApi';
import { Calendar, UserCircle, Clock } from 'lucide-react';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  isLoading: boolean;
}

export default function EventDetailModal({ isOpen, onClose, event, isLoading }: EventDetailModalProps) {
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          {isLoading && <DialogTitle>Loading Event...</DialogTitle>}
          {event && (
            <>
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
              <DialogDescription className="pt-2">
                Hosted by {event.createdBy.firstName} {event.createdBy.lastName}
              </DialogDescription>
            </>
          )}
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {isLoading && <p>Fetching details...</p>}
          {event && (
            <>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 mt-1 text-gray-600" />
                <div>
                  <p className="font-semibold">Start Time</p>
                  <p className="text-gray-700">{formatDate(event.startTime)}</p>
                </div>
              </div>
              {event.endTime && (
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-3 mt-1 text-gray-600" />
                  <div>
                    <p className="font-semibold">End Time</p>
                    <p className="text-gray-700">{formatDate(event.endTime)}</p>
                  </div>
                </div>
              )}
              {event.description && (
                <div>
                  <p className="font-semibold">Description</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}