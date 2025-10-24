import api from './config';

interface InviteResponse {
    inviteCode: string;
    expiresAt: string;
}
export interface Event {
    _id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    createdBy: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    courseGroup: {
      _id: string;
      groupName: string;
    };
}


export interface CourseGroup {
    _id: string;
    groupName: string;
    description?: string;
    ownerId: string | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    members: Array<{
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | string>; // Can be populated user objects or just IDs
}

// need to add this interface for members list since 
// i dont want to update the existing CourseGroup interface
export interface PopulatedCourseGroup {
    _id: string;
    groupName: string;
    description?: string;
    ownerId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    members: Array<{
        userId: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
        role: 'owner' | 'member';
        joinedAt?: string;
    }>;
}

export interface CreateGroupResponse {
    message: string;
    group: CourseGroup;
}

export interface JoinGroupResponse {
    message: string;
    group: {
        id: string;
        groupName: string;
    };
}

interface CreateEventData {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
}

interface TransferOwnershipResponse {
  message: string;
  group: CourseGroup;
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

export const getGroupById = async (groupId: string): Promise<CourseGroup> => {
  const response = await api.get<{ group: CourseGroup }>(`/groups/${groupId}`);
  return response.data.group;
};

// uses populated course group interface,
// does the same thing as getGroupById but returns populated members
// used for group members list
export const getGroupWithMembers = async (groupId: string): Promise<PopulatedCourseGroup> => {
  const response = await api.get<{ group: PopulatedCourseGroup }>(`/groups/${groupId}`);
  return response.data.group;
};

export const getUserGroups = async (): Promise<CourseGroup[]> => {
  const response = await api.get<{ groups: CourseGroup[] }>('/groups');
  return response.data.groups;
};

// Update a course group's details (owner only)
export const updateCourseGroup = (groupId: string, data: { groupName?: string; description?: string }) => {
  return api.put<{ message: string; group: CourseGroup }>(`/groups/${groupId}`, {
    groupName: data.groupName,
    description: data.description,
  });
};
// transfer group ownership to another member (owner only)
export const transferCourseGroupOwnership = async (
    groupId: string, 
    newOwnerId: string
  ): Promise<TransferOwnershipResponse> => {
  const response = await api.put<TransferOwnershipResponse>(
    `/groups/${groupId}/transfer-ownership`,
    { newOwnerId }
  );
  return response.data;
};

// Delete a course group (owner only)
export const deleteCourseGroup = (groupId: string) => {
  return api.delete<{ message: string }>(`/groups/${groupId}`);
};