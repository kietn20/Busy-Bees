import api from './config';

export interface Note {
    _id: string;
    title: string;
    content: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    groupId: string;
    createdAt: string;
    updatedAt: string;
}

interface CreateNoteData {
    title: string;
    content: string;
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