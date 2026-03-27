import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { mqttService } from '../services/mqttService';
import { useUser } from '../providers/UserContext';
import { MqttHint } from '../types';

export function useMqttConnection() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    mqttService.connect(user.id);

    const unsubscribe = mqttService.onHint((hint: MqttHint) => {
      console.log('[MQTT hint]', hint);
      switch (hint.type) {
        case 'BALANCE_UPDATED':
        case 'EXPENSE_ADDED':
        case 'SETTLEMENT_UPDATED':
        case 'MEMBER_CHANGED':
          queryClient.invalidateQueries({ queryKey: ['group', hint.groupId] });
          queryClient.invalidateQueries({ queryKey: ['home'] });
          break;
        case 'NOTIFICATIONS_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['notifications'], refetchType: 'all' });
          queryClient.invalidateQueries({ queryKey: ['home'] });
          break;
      }
    });

    return () => {
      unsubscribe();
      mqttService.disconnect();
    };
  }, [user?.id, queryClient]);
}
