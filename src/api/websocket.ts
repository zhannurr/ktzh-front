import { WS_BASE_URL } from './config';

export type WsMessageHandler = (data: unknown) => void;
export type WsStatusHandler = (status: 'open' | 'closed' | 'error') => void;

/**
 * Creates a WebSocket connection to /ws/:routeId and returns a cleanup function.
 *
 * Usage:
 * ```ts
 * const cleanup = connectRouteWebSocket(routeId, (frame) => {
 *   console.log('telemetry frame', frame);
 * });
 *
 * // Later, to disconnect:
 * cleanup();
 * ```
 */
export function connectRouteWebSocket(
  routeId: string,
  onMessage: WsMessageHandler,
  onStatus?: WsStatusHandler,
): () => void {
  const url = `${WS_BASE_URL}/ws/${routeId}`;
  const ws = new WebSocket(url);

  ws.addEventListener('open', () => {
    onStatus?.('open');
  });

  ws.addEventListener('message', (event) => {
    try {
      const parsed = JSON.parse(event.data as string);
      onMessage(parsed);
    } catch {
      // raw string message
      onMessage(event.data);
    }
  });

  ws.addEventListener('close', () => {
    onStatus?.('closed');
  });

  ws.addEventListener('error', () => {
    onStatus?.('error');
  });

  // Return cleanup function
  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}
