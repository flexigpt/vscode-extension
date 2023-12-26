import React from 'react';
import { WorkflowProvider } from 'workflowprovider';

const openAIKey = process.env.OPENAI_API_KEY;
export const workflowProvider = new WorkflowProvider();
workflowProvider.aiproviders.setAttribute('openai', "apiKey", openAIKey || "");

export const WorkflowProviderContext = React.createContext(workflowProvider);
