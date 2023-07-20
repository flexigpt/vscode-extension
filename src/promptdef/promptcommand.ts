export const COMMAND_TYPE_FULL = "full";
export const COMMAND_TYPE_CLI = "cli";

export class Command {
  constructor(
    public name: string,
    public questionTemplate: string,
    public responseHandler: any,
    public description: string,
    public namespace: string,
    public requestparams?: { [key: string]: any },
    public type: string = COMMAND_TYPE_FULL,
  ) {}
}
