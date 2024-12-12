import { useEffect } from 'react';
import { useQuestionStore } from '../store/useQuestionStore';
import { useWeb3Store } from '../store/useWeb3Store';

export function useQuestions(roomId: string | undefined) {
  const { fetchQuestions, isLoading, error } = useQuestionStore();
  const { address } = useWeb3Store();

  useEffect(() => {
    if (roomId && address) {
      fetchQuestions(roomId, address);
    }
  }, [roomId, fetchQuestions]);

  function refresh() {
    if (roomId && address) {
      fetchQuestions(roomId, address);
    }
  }

  return { isLoading, error, refresh };
}
