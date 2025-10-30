import api from './config';

export interface FlashcardSet {
    _id: string;
    setName: string;
    description?: string;
    flashcards: string[];
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    courseGroupId: string;
}

export interface CreateFlashcardSetResponse {
    message: string;
    flashcardSet: FlashcardSet;
}

export interface GetFlashcardSetsResponse {
    message: string;
    flashcardSets: FlashcardSet[];
}

export interface Flashcard {
  _id: string;
  term: string;
  definition: string;
}

export const getFlashcardSetsByGroup = async (groupId: string): Promise<GetFlashcardSetsResponse> => {
    const response = await api.get(`/groups/${groupId}/flashcards`);
    return response.data;
}

export const getFlashcardSetsById = async (groupId: string, setId: string): Promise<FlashcardSet> => {
    const response = await api.get<{ message: string; flashcardSet: FlashcardSet }>(`/groups/${groupId}/flashcards/${setId}`);
    return response.data.flashcardSet;
}

export const createFlashcardSet = async (
  groupId: string,
  setName: string,
  description?: string,
  flashcards?: { term: string; definition: string }[]
): Promise<CreateFlashcardSetResponse> => {
    console.log({groupId, setName, description, flashcards})
    const response = await api.post<CreateFlashcardSetResponse>(
    `/groups/${groupId}/flashcards`,
    { setName, description, flashcards, courseGroupId: groupId }
  );
  return response.data;
};

