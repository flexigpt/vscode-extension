import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosInstance,
} from "axios";
import log from "../logger/log";

export class GptAPI {
  origin: string;
  endpoint: string;
  apiKey: string;
  apiKeyHeaderKey: string;
  headers: Record<string, string>;
  logRequests: boolean = false;
  private axiosInstance: AxiosInstance;

  constructor(
    origin: string,
    endpoint: string,
    apiKey: string,
    apiKeyHeaderKey: string,
    headers: Record<string, string> = {}
  ) {
    this.origin = origin;
    this.endpoint = endpoint;
    this.apiKeyHeaderKey = apiKeyHeaderKey;
    if (apiKeyHeaderKey === "Authorization") {
      this.apiKey = "Bearer " + apiKey;
    } else {
      this.apiKey = apiKey;
    }
    this.headers = headers;

    this.axiosInstance = axios.create();

    if (this.logRequests) {
      //Add interceptor once in constructor
      this.axiosInstance.interceptors.request.use(
        (config: AxiosRequestConfig) => {
          // Caution: avoid logging sensitive information in production
          console.log("Axios Request:", config);
          console.log("cURL Command:", this.generateCurlCommand(config));
          return config;
        },
        (error) => {
          throw error;
        }
      );
    }
  }

  // Function to generate the cURL command
  generateCurlCommand(config: AxiosRequestConfig): string {
    let curlCommand = "curl -X " + config.method?.toUpperCase() + " ";
    curlCommand += '"' + config.url + '" ';

    // Headers
    if (config.headers) {
      Object.keys(config.headers).forEach((key) => {
        const value = config.headers?.[key];
        curlCommand += '-H "' + key + ": " + value + '" ';
      });
    }

    // Request body
    if (config.data) {
      curlCommand += "-d '" + JSON.stringify(config.data) + "' ";
    }

    return curlCommand;
  }

  async request<T>(requestConfig: AxiosRequestConfig): Promise<T> {
    const mergedHeaders = {
      [this.apiKeyHeaderKey]: this.apiKey,
      ...this.headers,
      ...(requestConfig.headers || {}),
    };

    const config: AxiosRequestConfig = {
      ...requestConfig,
      url: this.origin + this.endpoint + (requestConfig.url || ""),
      headers: mergedHeaders,
    };

    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request(
        config
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle Axios error
        const axiosError = error as AxiosError;
        let errorData: string;
        if (axiosError.response) {
          errorData =
            JSON.stringify(axiosError.response.data, null, 2) +
            JSON.stringify(axiosError.response.status, null, 2) +
            JSON.stringify(axiosError.response.headers, null, 2);
        } else {
          errorData = JSON.stringify(axiosError, null, 2);
        }
        error.message = errorData + error.message;
      }
      throw error;
    }
  }
}