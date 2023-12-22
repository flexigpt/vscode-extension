import { log } from 'logger/log';
import axios from 'axios';
import { promises as fs } from 'fs';

import { FunctionWrapper } from '../promptdef/promptfunctions';
import { Variable } from '../promptdef/promptvariables';
import { COMMAND_TYPE_CLI, Command } from '../promptdef/promptcommand';

import {
  CommandRunnerContext,
  DEFAULT_RESPONSE_HANDLER
} from './promptcommandrunner';
import { getFileNameAndExtension } from '../prompthelpers/fileutils';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (err) {
    return false;
  }
}

export const isHttpAddress = (urlString: string): boolean => {
  try {
    return urlString.toLowerCase().startsWith('http');
  } catch (e) {
    return false;
  }
};

export class FilesImporter {
  commandRunnerContext: CommandRunnerContext;

  constructor(commandRunnerContext: CommandRunnerContext) {
    this.commandRunnerContext = commandRunnerContext;
  }

  read(fileOrUrl: string) {
    let dataRead = '';
    return new Promise((resolve, reject) => {
      if (isHttpAddress(fileOrUrl)) {
        axios
          .get(fileOrUrl)
          .then(response => {
            dataRead = response.data;
            resolve(dataRead);
          })
          .catch(error => {
            log.error(`Error in read: ${error}`);
            reject(error);
          });
      } else {
        fs.readFile(fileOrUrl)
          .then(buffer => {
            dataRead = buffer.toString();
            resolve(dataRead);
          })
          .then(undefined, err => {
            log.error(`Error in read: ${err}`);
            reject(err);
          });
      }
    });
  }

  processFileContents(promptFile: string, userDefinitions: any) {
    let namespace = getFileNameAndExtension(promptFile).fileName;
    if (userDefinitions?.namespace) {
      namespace = userDefinitions.namespace;
    }
    if (userDefinitions?.commands) {
      userDefinitions.commands.forEach(
        (command: {
          name: any;
          template: any;
          responseHandler: any;
          description: any;
          requestparams: any;
        }) => {
          const intmpl = command.template as string;
          const addc = new Command(
            command.name,
            intmpl,
            command.responseHandler,
            command.description,
            namespace
          );
          if (command.description as string) {
            addc.description = command.description;
          } else {
            addc.description = command.name;
          }
          if (command.responseHandler) {
            addc.responseHandler = command.responseHandler;
          } else {
            addc.responseHandler = DEFAULT_RESPONSE_HANDLER;
          }
          if (command.requestparams as { [key: string]: any }) {
            addc.requestparams = command.requestparams;
          }
          this.commandRunnerContext.addCommand(addc);
        }
      );
    }
    if (userDefinitions?.variables) {
      userDefinitions.variables.forEach(
        (variable: { name: any; value: any }) => {
          this.commandRunnerContext.setUserVariable(
            namespace,
            new Variable(variable.name, variable.value)
          );
        }
      );
    }

    if (userDefinitions?.functions) {
      userDefinitions.functions.forEach((fn: Function) => {
        // log.info(`Importing function ${fn.name}`);
        this.commandRunnerContext.setFunction(
          namespace,
          FunctionWrapper.fromFunction(fn)
        );
      });
      // log.info(`Imported functions: ${JSON.stringify(this.commandRunnerContext.functionContext.getFunctions())} `);
    }

    if (userDefinitions?.cliCommands) {
      userDefinitions.cliCommands.forEach(
        (cliCommand: { name: any; command: any; description: any }) => {
          const intmpl = cliCommand.command as string;
          const addc = new Command(
            cliCommand.name,
            intmpl,
            undefined,
            cliCommand.description,
            namespace,
            undefined,
            COMMAND_TYPE_CLI
          );
          if (cliCommand.description as string) {
            addc.description = cliCommand.description;
          } else {
            addc.description = cliCommand.name;
          }
          this.commandRunnerContext.addCommand(addc);
        }
      );
    }
  }

  importJsPromptFile(promptFile: string) {
    this.read(promptFile)
      .then(data => {
        const c = data as string;
        const userDefinitions = eval(c);
        this.processFileContents(promptFile, userDefinitions);
      })
      .then(undefined, err => {
        log.error(`Error in readfile ${err}`);
      })
      .catch(error => {
        log.error(`Caught error in readFile ${error}`);
      });
  }

  importJsonPromptFile(promptFile: string) {
    this.read(promptFile)
      .then(data => {
        const c = data as string;
        const userDefinitions = JSON.parse(c);
        this.processFileContents(promptFile, userDefinitions);
        // log.info(data);
      })
      .then(undefined, err => {
        log.error(`Error in readfile ${err}`);
      })
      .catch(error => {
        log.error(`Caught error in readFile ${error}`);
      });
  }

  getFileType(promptFile: string): string | undefined {
    if (promptFile) {
      return promptFile.split('.')?.pop()?.toLowerCase();
    }
  }

  importFile(filePath: string) {
    if (filePath === '') {
      log.info('Empty file prompt. skipping.');
      return;
    }
    fileExists(filePath)
      .then(data => {
        if (!data) {
          log.info(`Couldn't find file "${filePath}". Skipping import`);
        } else {
          const fileType = this.getFileType(filePath);
          if (fileType === 'js') {
            this.importJsPromptFile(filePath);
          } else if (fileType === 'json') {
            this.importJsonPromptFile(filePath);
          }
        }
      })
      .catch(error => {
        log.error(error);
      });
  }

  public splitPromptFiles(promptFiles: string): Array<string> {
    if (!promptFiles) {
      return [];
    }
    return promptFiles.split(';');
  }

  public importPromptFiles(allPromptFiles: string[]) {
    log.info(allPromptFiles);
    allPromptFiles.forEach(sf => {
      try {
        this.importFile(sf);
      } catch (error) {
        log.error(error);
        return;
      }
    });
  }
}
