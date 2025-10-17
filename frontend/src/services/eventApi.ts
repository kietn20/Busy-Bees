// Purpose: API service for all top-level event endpoints

import api from './config';
import { Event } from './groupApi';

export interface UpdateEventData {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

// fetches the full details for a single event
export const getEventById = async (eventId: string): Promise<Event> => {
  const response = await api.get<Event>(`/events/${eventId}`);
  return response.data;
};

export const updateEvent = async (eventId: string, eventData: UpdateEventData): Promise<Event> => {
  const response = await api.put<Event>(`/events/${eventId}`, eventData);
  return response.data;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await api.delete(`/events/${eventId}`);
};