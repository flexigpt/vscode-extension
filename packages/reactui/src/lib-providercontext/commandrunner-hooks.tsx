import { useContext } from 'react';
import { WorkflowProviderContext } from './providercontext';
import { Command } from 'prompts/promptdef/promptcommand';
import { CompletionProvider } from 'aiprovider/strategy';
import { CompletionRequest } from 'spec/chat';

// Hook for preparing command
export function usePrepareCommand() {
  const workflowProvider = useContext(WorkflowProviderContext);

  return (line: string) => {
    return workflowProvider.prepareCommand(line);
  };
}

// Hook for creating completion request
export function useCreateCompletionRequest() {
  const workflowProvider = useContext(WorkflowProviderContext);

  return async (
    reqUUID: string,
    inPrompt: string,
    question: string,
    command: Command,
    useConversation?: boolean
  ) => {
    return await workflowProvider.createCompletionRequest(
      reqUUID,
      inPrompt,
      question,
      command,
      useConversation
    );
  };
}

// Hook for getting completion response
export function useGetCompletionResponse() {
  const workflowProvider = useContext(WorkflowProviderContext);

  return async (
    reqUUID: string,
    apiProvider: CompletionProvider,
    crequest: CompletionRequest,
    useConversation?: boolean,
    docLanguage?: string
  ) => {
    return await workflowProvider.getCompletionResponse(
      reqUUID,
      apiProvider,
      crequest,
      useConversation,
      docLanguage
    );
  };
}

// Hook for post-processing response
export function usePostProcessResp() {
  const workflowProvider = useContext(WorkflowProviderContext);

  return (command: Command, response: string, docLanguage?: string) => {
    return workflowProvider.postProcessResp(command, response, docLanguage);
  };
}

// Hook for getting response using input
export function useGetResponseUsingInput() {
  const workflowProvider = useContext(WorkflowProviderContext);

  return async (line: string) => {
    return await workflowProvider.getResponseUsingInput(line);
  };
}
