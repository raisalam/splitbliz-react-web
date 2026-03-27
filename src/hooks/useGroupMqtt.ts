import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { mqttService } from '../services/mqttService';
import { MqttChatMessage } from '../types';

export function useGroupMqtt(groupId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!groupId) return;

    mqttService.subscribeToGroup(groupId);

    const unsubscribeChat = mqttService.onChatMessage(groupId, (msg: MqttChatMessage) => {
      queryClient.setQueryData(
        ['messages', groupId],
        (old: any) => {
          if (!old) {
            return { pages: [{ messages: [msg], pagination: { nextCursor: null, hasMore: false, limit: 0 } }], pageParams: [undefined] };
          }
          const pages = old.pages ?? [];
          const lastPageIndex = pages.length - 1;
          const lastPage = pages[lastPageIndex] ?? { messages: [] };
          const exists = pages.some((page: any) =>
            page.messages?.some((m: MqttChatMessage) => m.clientMessageId === msg.clientMessageId)
          );
          if (exists) return old;
          const nextPages = [...pages];
          nextPages[lastPageIndex] = {
            ...lastPage,
            messages: [...(lastPage.messages ?? []), msg],
          };
          return { ...old, pages: nextPages };
        }
      );
    });

    return () => {
      unsubscribeChat();
      mqttService.unsubscribeFromGroup(groupId);
    };
  }, [groupId, queryClient]);
}
