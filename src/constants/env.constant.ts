export const ENV_KEYS = import.meta.env;

class EnvConfig {
  public readonly endpoint: string;

  constructor() {
    this.endpoint = import.meta.env.VITE_APP_FEED_API_ENPOINT || "";
  }
}

export const envFeedConfig = new EnvConfig();
