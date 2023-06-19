import { getValueWithKey } from "./promptvariables";

export class Command {
    constructor(
      public name: string,
      public questionTemplate: string,
      public responseHandler: any,
      public description: string,
      public requestparams?: { [key: string]: any }
    ) {}
  
    prepare(systemVariables: any, userVariables: any) {
      const variables = {
        system: systemVariables,
        user: userVariables,
      };
      // log.info(`question template input: ${this.questionTemplate}`);
      // let matches = this.questionTemplate.match(/\{([^}]+)\}/g);
      // log.info(`question template input: ${this.questionTemplate}. Matches: ${matches}`);
      const question = this.questionTemplate.replace(
        /\{([^}]+)\}/g,
        (match, key) => {
          let v = getValueWithKey(key, variables);
          if (v === key) {
            // We got the key again. try it in system vars
            v = getValueWithKey(`system.${v}`, variables);  
          }
          return v;
        }
      );
  
      return question;
    }
  }