import api from './config';

export interface Note {
  _id: string;
  title: string;
  content: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  collaborators: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateNoteData {
  title: string;
  content: string;
}

interface UpdateNoteData {
  title?: string;
  content?: string;
}

export const createNote = async (groupId: string, data: CreateNoteData): Promise<Note> => {
  const response = await api.post<Note>(`/groups/${groupId}/notes`, data);
  return response.data;
}

export const getNotesByGroup = async (groupId: string): Promise<{ notes: Note[] }> => {
  const response = await api.get<{ notes: Note[] }>(`/groups/${groupId}/notes`);
  return response.data;
};

export const getNoteById = async (groupId: string, noteId: string): Promise<{ note: Note }> => {
  const response = await api.get<{ note: Note }>(`/groups/${groupId}/notes/${noteId}`);
  return response.data;
}

export const updateNote = async (groupId: string, noteId: string, data: UpdateNoteData): Promise<Note> => {
  const response = await api.put<Note>(`/groups/${groupId}/notes/${noteId}`, data);
  return response.data;
};

export const deleteNote = async (groupId: string, noteId: string): Promise<void> => {
  await api.delete(`/groups/${groupId}/notes/${noteId}`);
};

export const updateCollaborators = async (groupId: string, noteId: string, collaboratorIds: string[]): Promise<Note> => {
  const response = await api.put<{ message: string, note: Note }>(
    `/groups/${groupId}/notes/${noteId}/collaborators`,
    { collaborators: collaboratorIds }
  );
  return response.data.note;
};