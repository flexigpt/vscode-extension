export default class Provider {
  constructor(private strategy: Strategy) {}

  generate(input: string) {
    return this.strategy.generate(input);
  }

  refactor(input: string) {
    return this.strategy.refactor(input);
  }
}

export interface Strategy {
  generate(input: string): Promise<string | null>;
  refactor(input: string): Promise<string | null>;
}
