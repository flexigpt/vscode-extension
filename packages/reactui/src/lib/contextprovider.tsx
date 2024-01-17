import React, { ReactNode, createContext, useEffect, useState } from 'react';
import { WorkflowProvider as BaseWorkflowProvider } from 'workflowprovider';

export class WorkflowProvider extends BaseWorkflowProvider {
  constructor() {
    super();
    const openAIKey = process.env.OPENAI_API_KEY || '';
    this.aiproviders.setAttribute('openai', 'apiKey', openAIKey);
  }
}

export const WorkflowProviderContext = createContext<WorkflowProvider | null>(
  null
);

interface WorkflowProviderContextProviderProps {
  children: ReactNode;
}

export const WorkflowProviderContextProvider: React.FC<
  WorkflowProviderContextProviderProps
> = ({ children }) => {
  const [provider, setProvider] = useState<WorkflowProvider | null>(null);

  useEffect(() => {
    const newProvider = new WorkflowProvider();
    setProvider(newProvider);

    // return () => {
    // };
  }, []);

  return (
    <WorkflowProviderContext.Provider value={provider}>
      {children}
    </WorkflowProviderContext.Provider>
  );
};
