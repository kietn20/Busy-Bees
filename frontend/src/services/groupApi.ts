// Purpose: API service for all course group related endpoints

import api from './config';

interface InviteResponse {
    inviteCode: string;
    expiresAt: string;
}

export const joinGroup = (inviteCode: string) => {
  return api.post('/groups/join', { inviteCode });
};

export const generateInvite = (groupId: string) => {
  return api.get<InviteResponse>(`/groups/${groupId}/invite`);
};