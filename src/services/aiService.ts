import apiClient from './apiClient';

export type AiPromptResponse = {
  providerUsed: string;
  result: string;
  timestamp: string;
};

export const aiService = {
  async prompt(prompt: string, data?: unknown): Promise<AiPromptResponse> {
    const payload = {
      prompt,
      data: data ? JSON.stringify(data) : undefined,
    };
    const res = await apiClient.post<AiPromptResponse>('/ai/prompt', payload);
    return res.data;
  },
};
