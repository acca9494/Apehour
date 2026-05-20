const MOCK_LATENCY = 320;

export async function mockFetch<T>(payload: T, options?: { fail?: boolean; latency?: number }): Promise<T> {
  const latency = options?.latency ?? MOCK_LATENCY;

  await new Promise((resolve) => {
    setTimeout(resolve, latency);
  });

  if (options?.fail) {
    throw new Error("The restaurant service is temporarily unavailable.");
  }

  return payload;
}

export async function mockServerFetch<T>(
  payload: T,
  options?: { fail?: boolean; latency?: number },
): Promise<T> {
  const latency = options?.latency ?? MOCK_LATENCY;

  await new Promise((resolve) => {
    setTimeout(resolve, latency);
  });

  if (options?.fail) {
    throw new Error("The restaurant service is temporarily unavailable.");
  }

  return payload;
}
