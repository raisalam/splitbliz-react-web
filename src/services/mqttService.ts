import Paho from 'paho-mqtt';
import { MqttHint, MqttChatMessage } from '../types';
import { MQTT_TOPICS } from '../constants/app';
import { tokenStore } from './apiClient';

type HintHandler = (hint: MqttHint) => void;
type ChatHandler = (message: MqttChatMessage) => void;

class MqttService {
  private client: Paho.Client | null = null;
  private hintHandlers: Set<HintHandler> = new Set();
  private chatHandlers: Map<string, Set<ChatHandler>> = new Map();
  private subscribedTopics: Set<string> = new Set();

  connect(userId: string): void {
    const url = import.meta.env.VITE_MQTT_URL ?? 'ws://localhost:8083/mqtt';
    const clientId = `web_${userId}_${Date.now()}`;
    const token = tokenStore.get();

    this.client = new Paho.Client(url, clientId);

    this.client.onMessageArrived = (message) => {
      this.handleMessage(message);
    };

    this.client.onConnectionLost = (response) => {
      if (response.errorCode !== 0) {
        console.warn('[MQTT] Connection lost:', response.errorMessage);
        setTimeout(() => this.connect(userId), 3000);
      }
    };

    this.client.connect({
      useSSL: url.startsWith('wss'),
      userName: userId,
      password: token ?? undefined,
      onSuccess: () => {
        console.log('[MQTT] Connected');
        this.subscribe(MQTT_TOPICS.userHints(userId));
      },
      onFailure: (err) => {
        console.warn('[MQTT] Connection failed:', err.errorMessage);
      },
    });
  }

  subscribe(topic: string): void {
    if (!this.client?.isConnected() || this.subscribedTopics.has(topic)) return;
    this.client.subscribe(topic, { qos: 0 });
    this.subscribedTopics.add(topic);
    console.log('[MQTT] Subscribed:', topic);
  }

  subscribeToGroup(groupId: string): void {
    if (this.subscribedTopics.has(MQTT_TOPICS.groupHints(groupId)) && this.subscribedTopics.has(MQTT_TOPICS.groupMessages(groupId))) {
      return;
    }
    this.subscribe(MQTT_TOPICS.groupHints(groupId));
    this.subscribe(MQTT_TOPICS.groupMessages(groupId));
  }

  unsubscribeFromGroup(groupId: string): void {
    const hintTopic = MQTT_TOPICS.groupHints(groupId);
    const chatTopic = MQTT_TOPICS.groupMessages(groupId);
    if (this.client?.isConnected()) {
      this.client.unsubscribe(hintTopic);
      this.client.unsubscribe(chatTopic);
    }
    this.subscribedTopics.delete(hintTopic);
    this.subscribedTopics.delete(chatTopic);
  }

  onHint(handler: HintHandler): () => void {
    this.hintHandlers.add(handler);
    return () => this.hintHandlers.delete(handler);
  }

  onChatMessage(groupId: string, handler: ChatHandler): () => void {
    if (!this.chatHandlers.has(groupId)) {
      this.chatHandlers.set(groupId, new Set());
    }
    this.chatHandlers.get(groupId)!.add(handler);
    return () => this.chatHandlers.get(groupId)?.delete(handler);
  }

  disconnect(): void {
    if (this.client?.isConnected()) {
      this.client.disconnect();
    }
    this.subscribedTopics.clear();
  }

  private handleMessage(message: Paho.Message): void {
    try {
      const payload = JSON.parse(message.payloadString);
      const topic = message.destinationName;

      if (topic.endsWith('/hints')) {
        this.hintHandlers.forEach(h => h(payload as MqttHint));
      } else if (topic.endsWith('/messages')) {
        const groupId = topic.split('/')[2];
        console.log('[MQTT message]', { topic, groupId, payload });
        this.chatHandlers.get(groupId)?.forEach(h => h(payload as MqttChatMessage));
      }
    } catch (e) {
      console.warn('[MQTT] Failed to parse message:', e);
    }
  }
}

export const mqttService = new MqttService();
