import { useContext } from 'react';
import { WorkflowProviderContext } from './providercontext';

// Hook for importing all prompt files
export function useImportAllPromptFiles() {
  const workflowProvider = useContext(WorkflowProviderContext);

  return (promptPaths: string[]) => {
    workflowProvider.importAllPromptFiles(promptPaths);
  };
}
