import { api } from './api.js';

export const chatService = {
  sendChatMessage: async (message, history = []) => {
    const response = await api.post('/chat', { message, history });
    return response.data;
  }
};
