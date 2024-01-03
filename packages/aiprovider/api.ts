import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { log } from 'logger/log';

export function filterSensitiveInfo(obj: any): any {
  const sensitiveKeys = ['authorization', 'key'];

  // Base case: if obj is not an object, return it as is.
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // Recursive case: if obj is an array, filter each element.
  if (Array.isArray(obj)) {
    return obj.map(item => filterSensitiveInfo(item));
  }

  // Recursive case: if obj is an object, filter each key.
  const filteredObj: any = {};
  for (const key in obj) {
    if (
      !sensitiveKeys.some(sensitiveKey =>
        key.toLowerCase().includes(sensitiveKey)
      )
    ) {
      filteredObj[key] = filterSensitiveInfo(obj[key]);
    }
  }
  return filteredObj;
}

export function filterSensitiveInfoFromJsonString(jsonString: string): string {
  const jsonObj = JSON.parse(jsonString);
  const filteredObj = filterSensitiveInfo(jsonObj);
  return JSON.stringify(filteredObj);
}

export class GptAPI {
  origin: string;
  apiKey: string;
  apiKeyHeaderKey: string;
  timeout: number;
  defaultCompletionModel: string;
  defaultChatCompletionModel: string;
  headers: Record<string, string>;
  logRequests = false;
  private axiosInstance: AxiosInstance;

  constructor(
    origin: string,
    apiKey: string,
    apiKeyHeaderKey: string,
    timeout: number,
    defaultCompletionModel: string,
    defaultChatCompletionModel: string,
    headers: Record<string, string> = {}
  ) {
    this.origin = origin;
    this.apiKeyHeaderKey = apiKeyHeaderKey;
    this.apiKey = apiKey;
    this.timeout = timeout;
    this.defaultCompletionModel = defaultCompletionModel;
    this.defaultChatCompletionModel = defaultChatCompletionModel;
    this.headers = headers;

    this.axiosInstance = axios.create();

    if (this.logRequests) {
      //Add interceptor once in constructor
      this.axiosInstance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          // Caution: avoid logging sensitive information in production
          log.info('Axios Request:', config);
          log.info('cURL Command:', this.generateCurlCommand(config));
          return config;
        },
        error => {
          throw error;
        }
      );
    }
  }

  // Method to set attribute values
  public setAttribute(key: string, value: any): void {
    // Check if the attribute exists in the class
    if (!(key in this)) {
      log.error(`Attribute '${key}' does not exist in the class.`);
      return;
    }
    // Check if the value is not null or undefined
    if (value === null || value === undefined) {
      log.error('Value cannot be null or undefined.');
      return;
    }

    // Check if the type of the value matches the type of the attribute in the class
    const currentType = typeof this[key as keyof this];
    const valueType = typeof value;

    if (currentType !== valueType) {
      log.error(
        `Type mismatch: Expected ${currentType}, but got ${valueType}.`
      );
      return;
    }

    // Set the value
    this[key as keyof this] = value;
  }

  // Function to generate the cURL command
  generateCurlCommand(config: AxiosRequestConfig): string {
    let curlCommand = 'curl -X ' + config.method?.toUpperCase() + ' ';
    curlCommand += '"' + config.url + '" ';

    // Headers
    if (config.headers) {
      Object.keys(config.headers).forEach(key => {
        const value = config.headers?.[key];
        curlCommand += '-H "' + key + ': ' + value + '" ';
      });
    }

    // Request body
    if (config.data) {
      curlCommand += "-d '" + JSON.stringify(config.data) + "' ";
    }

    return curlCommand;
  }

  async request<T>(requestConfig: AxiosRequestConfig): Promise<T> {
    let apiKey = this.apiKey;
    if (this.apiKeyHeaderKey === 'Authorization') {
      apiKey = 'Bearer ' + apiKey;
    }
    const mergedHeaders = {
      ...(this.apiKeyHeaderKey ? { [this.apiKeyHeaderKey]: apiKey } : {}),
      ...this.headers,
      ...(requestConfig.headers || {})
    };

    const config: AxiosRequestConfig = {
      ...requestConfig,
      url: this.origin + (requestConfig.url || ''),
      headers: mergedHeaders
    };

    try {
      const response: AxiosResponse<T> =
        await this.axiosInstance.request(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios error
        const axiosError = error as AxiosError;
        let errorData: string;
        if (axiosError.response) {
          const headers = filterSensitiveInfo(axiosError.response.headers);
          errorData =
            JSON.stringify(axiosError.response.data, null, 2) +
            '\n' +
            JSON.stringify(axiosError.response.status, null, 2) +
            '\n' +
            JSON.stringify(headers, null, 2) +
            '\n';
        } else {
          errorData = JSON.stringify(axiosError, null, 2) + '\n';
        }
        error.message = errorData + '\n' + error.message;
      }
      throw error;
    }
  }
}
