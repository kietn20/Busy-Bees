import api from './config';

export interface Note {
    _id: string;
    title: string;
    content: string;
    userId: string;
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