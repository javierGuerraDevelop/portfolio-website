import { useState, useEffect, useCallback } from 'react';
import { APIResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiOptions {
    immediate?: boolean;
}

export function useApi<T>(endpoint: string, options: UseApiOptions = { immediate: true }) {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: options.immediate ?? true,
        error: null,
    });

    const fetchData = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: APIResponse<T> = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'An error occurred');
            }

            setState({
                data: result.data ?? null,
                loading: false,
                error: null,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setState({
                data: null,
                loading: false,
                error: errorMessage,
            });
        }
    }, [endpoint]);

    useEffect(() => {
        if (options.immediate) {
            fetchData();
        }
    }, [fetchData, options.immediate]);

    return {
        ...state,
        refetch: fetchData,
    };
}

export async function postApi<T, B>(endpoint: string, body: B): Promise<APIResponse<T>> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const result: APIResponse<T> = await response.json();
    return result;
}
