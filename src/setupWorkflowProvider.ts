import * as vscode from 'vscode';

import { WorkflowProvider } from 'workflowprovider';
import log from './logger/log';

export function updateAIProvider(
  config: vscode.WorkspaceConfiguration,
  workflowProvider: WorkflowProvider,
  aiProviderName: string
) {
  try {
    if (!aiProviderName) {
      log.error('No AI provider name given');
      return;
    }
    const apiKey = config.get(`${aiProviderName}.apiKey`) as string;
    if (!apiKey) {
      log.info(`${aiProviderName} API provider not initialized, no apikey`);
      return;
    }
    workflowProvider.aiproviders.setAttribute(aiProviderName, 'apiKey', apiKey);
    const timeout = config.get(`${aiProviderName}.timeout`) as number;
    if (timeout) {
      workflowProvider.aiproviders.setAttribute(
        aiProviderName,
        'timeout',
        timeout
      );
    }
    const defaultCompletionModel = config.get(
      `${aiProviderName}.defaultCompletionModel`
    ) as string;
    if (defaultCompletionModel) {
      workflowProvider.aiproviders.setAttribute(
        aiProviderName,
        'defaultCompletionModel',
        defaultCompletionModel
      );
    }
    const defaultChatCompletionModel = config.get(
      `${aiProviderName}.defaultChatCompletionModel`
    ) as string;
    if (defaultChatCompletionModel) {
      workflowProvider.aiproviders.setAttribute(
        aiProviderName,
        'defaultChatCompletionModel',
        defaultChatCompletionModel
      );
    }
    const defaultOrigin = config.get(
      `${aiProviderName}.defaultOrigin`
    ) as string;
    if (defaultOrigin) {
      workflowProvider.aiproviders.setAttribute(
        aiProviderName,
        'origin',
        defaultOrigin
      );
    }
    log.info(`${aiProviderName} API provider initialized`);
  } catch (error) {
    log.error(`Got error in updating API provider: ${aiProviderName}`);
    log.error(error);
  }
}

export function updateDefaultProvider(
  config: vscode.WorkspaceConfiguration,
  workflowProvider: WorkflowProvider
) {
  const defaultProvider = config.get('defaultProvider') as string;
  if (defaultProvider) {
    workflowProvider.aiproviders.defaultProvider = defaultProvider;
  }
  log.info(`Default provider set as: ${defaultProvider}`);
}

export function getWorkflowProvider(): WorkflowProvider {
  const workflowProvider = new WorkflowProvider();
  const config = vscode.workspace.getConfiguration('flexigpt');

  updateAIProvider(config, workflowProvider, 'openai');
  updateAIProvider(config, workflowProvider, 'anthropic');
  updateAIProvider(config, workflowProvider, 'huggingface');
  updateAIProvider(config, workflowProvider, 'googlegl');
  updateAIProvider(config, workflowProvider, 'llamacpp');
  updateDefaultProvider(config, workflowProvider);
  return workflowProvider;
}
