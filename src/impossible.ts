export function impossible(x: never): never {
  throw new Error(`reached impossible variant: ${x}`);
}
