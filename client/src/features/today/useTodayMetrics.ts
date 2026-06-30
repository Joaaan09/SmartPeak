import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '../../lib/api';
import type { DailyMetricsDto, LatestMetricsResponse } from './types';

// Hook de datos biométricos de la pestaña Hoy (GET /api/metrics/latest).
//
// Sigue el patrón de AuthContext: fetch en useEffect, sin react-query. El
// accessToken lo inyecta `apiRequest` de forma transparente.
//
// Re-fetch al volver a la app: escucha `visibilitychange` y `focus`. Cuando el
// usuario vuelve del Atajo de iOS (botón "Sincronizar"), la pantalla se refresca
// sola sin pulsar nada.

export type TodayStatus = 'loading' | 'error' | 'ready';

export interface UseTodayMetrics {
  status: TodayStatus;
  dailyMetrics: DailyMetricsDto | null;
  error: string | null;
  refetch: () => void;
}

export function useTodayMetrics(): UseTodayMetrics {
  const [status, setStatus] = useState<TodayStatus>('loading');
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetricsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Evita setState tras desmontaje y descarta respuestas obsoletas (la última
  // petición lanzada gana).
  const reqIdRef = useRef(0);
  const mountedRef = useRef(true);

  const fetchMetrics = useCallback(async (showLoading: boolean) => {
    const reqId = ++reqIdRef.current;
    if (showLoading) setStatus('loading');
    setError(null);
    try {
      const { dailyMetrics: data } =
        await apiRequest<LatestMetricsResponse>('/metrics/latest');
      if (!mountedRef.current || reqId !== reqIdRef.current) return;
      setDailyMetrics(data);
      setStatus('ready');
    } catch {
      if (!mountedRef.current || reqId !== reqIdRef.current) return;
      setError('No se pudieron cargar tus datos.');
      setStatus('error');
    }
  }, []);

  // Re-fetch público: no parpadea con skeleton si ya hay datos en pantalla.
  const refetch = useCallback(() => {
    void fetchMetrics(false);
  }, [fetchMetrics]);

  // Carga inicial.
  useEffect(() => {
    mountedRef.current = true;
    void fetchMetrics(true);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchMetrics]);

  // Re-fetch al volver a la app (vuelta del Atajo de iOS).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void fetchMetrics(false);
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [fetchMetrics]);

  return { status, dailyMetrics, error, refetch };
}
