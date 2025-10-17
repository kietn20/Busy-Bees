// Purpose: API service for all course group related endpoints

import api from './config';

interface InviteResponse {
    inviteCode: string;
    expiresAt: string;
}

export interface Event {
    _id: string;
    title: string;
    description?: string;
    startTime: string; // Dates are strings in JSON
    endTime?: string;
    createdBy: {
        _id: string;
        firstName: string;
        lastName: string;
    };
}

export interface Group {
    _id: string;
    groupName: string;
    description?: string;
    ownerId: string;
    members: string[];
}

export interface CreateGroupResponse {
    message: string;
    group: Group;
}

export interface JoinGroupResponse {
    message: string;
    group: Group;
}

interface CreateEventData {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
}

export const createGroup = (groupName: string, description?: string) => {
  return api.post<CreateGroupResponse>('/groups', { groupName, description });
};

export const joinGroup = (inviteCode: string) => {
  return api.post<JoinGroupResponse>('/groups/join', { inviteCode });
};

export const generateInvite = (groupId: string) => {
  return api.get<InviteResponse>(`/groups/${groupId}/invite`);
};

export const createEvent = async (groupId: string, eventData: CreateEventData): Promise<Event> => {
  const response = await api.post<Event>(`/groups/${groupId}/events`, eventData);
  return response.data;
};

export const getGroupEvents = async (groupId: string): Promise<Event[]> => {
    const response = await api.get<Event[]>(`/groups/${groupId}/events`);
    return response.data;
};