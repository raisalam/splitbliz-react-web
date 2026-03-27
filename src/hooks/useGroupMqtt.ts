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
          if (!old) return old;
          const exists = old.messages?.some(
            (m: MqttChatMessage) => m.clientMessageId === msg.clientMessageId
          );
          if (exists) return old;
          return { ...old, messages: [...(old.messages ?? []), msg] };
        }
      );
    });

    return () => {
      unsubscribeChat();
      mqttService.unsubscribeFromGroup(groupId);
    };
  }, [groupId, queryClient]);
}
