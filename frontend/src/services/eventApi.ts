// Purpose: API service for all top-level event endpoints

import api from './config';
import { Event } from './groupApi';

// fetches the full details for a single event
export const getEventById = async (eventId: string): Promise<Event> => {
  const response = await api.get<Event>(`/events/${eventId}`);
  return response.data;
};