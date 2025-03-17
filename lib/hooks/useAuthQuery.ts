import { useAuth } from "../auth/provider";
import {
  UseQueryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useAuthQuery<TData, TError = Error>(
  queryKey: string[],
  queryFn: (token: string) => Promise<TData>,
  options: Omit<
    UseQueryOptions<TData, TError, TData>,
    "queryKey" | "queryFn"
  > = {}
) {
  const { getToken, isAuthenticated } = useAuth();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      const token = await getToken();
      return queryFn(token);
    },
    ...options,
    enabled: isAuthenticated && options.enabled !== false,
  });
}

export function useAuthMutation<TVariables, TData, TError = Error>(
  mutationFn: (variables: TVariables, token: string) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
    onError?: (error: TError, variables: TVariables) => void;
    invalidateQueries?: string[];
  } = {}
) {
  const { getToken, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      if (!isAuthenticated) {
        throw new Error("Not authenticated");
      }

      const token = await getToken();
      return mutationFn(variables, token);
    },
    onSuccess: async (data: TData, variables: TVariables) => {
      // Invalidate queries when mutation succeeds
      if (options.invalidateQueries) {
        await queryClient.invalidateQueries({
          queryKey: options.invalidateQueries,
        });
      }

      if (options.onSuccess) {
        await options.onSuccess(data, variables);
      }
    },
    onError: options.onError,
  });
}
