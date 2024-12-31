import boxen from "boxen";

export function announce(message: string, title?: string) {
  console.log(
    boxen(message, {
      padding: 1,
      margin: 3,
      title: title || "Stagehand",
    })
  );
}

/**
 * Get an environment variable and throw an error if it's not found
 * @param name - The name of the environment variable
 * @returns The value of the environment variable
 */
export function getEnvVar(name: string, required = true): string | undefined {
  const value = process.env[name];
  if (!value && required) {
    throw new Error(`${name} not found in environment variables`);
  }
  return value;
}
