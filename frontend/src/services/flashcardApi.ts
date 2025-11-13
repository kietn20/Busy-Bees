import api from './config';

export interface FlashcardSet {
    _id: string;
    setName: string;
    description?: string;
    flashcards: (string | Flashcard)[]; 
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

export const getFlashcardById = async (
  groupId: string,
  flashcardId: string
): Promise<Flashcard> => {
  const response = await api.get<{ message: string; flashcard: Flashcard }>(
    `/groups/${groupId}/flashcards/cards/${flashcardId}`
  );
  return response.data.flashcard;
};

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

export const createFlashcard = async (
  groupId: string,
  setId: string,
  term: string,
  definition: string
): Promise<Flashcard> => {
  const response = await api.post<{ message: string; flashcard: Flashcard }>(
    `/groups/${groupId}/flashcards/cards`,
    { setId, term, definition }
  );
  return response.data.flashcard;
};

// for editing set name and description
export const editFlashcardSet = async (
  groupId: string,
  setId: string,
  setName: string,
  description?: string,
  flashcards?: string[]
): Promise<CreateFlashcardSetResponse> => {
    const response = await api.put<CreateFlashcardSetResponse>(
      `/groups/${groupId}/flashcards/sets/${setId}`,
      { setName, description, flashcards }
    );
    return response.data;
};

// for editing term and definition
export const editFlashcard = async (
  groupId: string,
  flashcardId: string,
  term: string,
  definition: string
): Promise<Flashcard> => {
  const response = await api.put<Flashcard>(
    `/groups/${groupId}/flashcards/cards/${flashcardId}`,
    { term, definition }
  );
  return response.data;
};

export const deleteFlashcard = async (
  groupId: string,
  flashcardId: string
): Promise<void> => {
  await api.delete(`/groups/${groupId}/flashcards/cards/${flashcardId}`);
};

export const deleteFlashcardSet = async (
  groupId: string,
  setId: string
): Promise<void> => {
  await api.delete(`/groups/${groupId}/flashcards/sets/${setId}`);
};

export const generateFlashcardsFromNote = async (
  groupId: string,
  noteContent: string,
  numFlashcards: number
): Promise<{ flashcards: { term: string; definition: string }[] }> => {
  const response = await api.post(
    `/groups/${groupId}/flashcards/generate-from-note`,
    { noteContent, numFlashcards }
  );
  return response.data;
};