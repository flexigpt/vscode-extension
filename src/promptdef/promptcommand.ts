export class Command {
  constructor(
    public name: string,
    public questionTemplate: string,
    public responseHandler: any,
    public description: string,
    public namespace: string,
    public requestparams?: { [key: string]: any }
  ) {}
}
