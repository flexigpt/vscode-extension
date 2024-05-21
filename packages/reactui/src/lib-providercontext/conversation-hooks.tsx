import { useContext } from 'react';
import { WorkflowProviderContext } from './providercontext';

// Hook for importing conversations
export function useImportConversations() {
  const workflowProvider = useContext(WorkflowProviderContext);

  return (conversationHistoryPath: string, startNewConversation?: boolean) => {
    workflowProvider.importConversations(
      conversationHistoryPath,
      startNewConversation
    );
  };
}

// Hook for clearing conversation
export function useClearConversation() {
  const workflowProvider = useContext(WorkflowProviderContext);

  return () => {
    workflowProvider.clearConversation();
  };
}

// Hook for saving conversation
export function useSaveConversation() {
  const workflowProvider = useContext(WorkflowProviderContext);

  return () => {
    workflowProvider.saveConversation();
  };
}
