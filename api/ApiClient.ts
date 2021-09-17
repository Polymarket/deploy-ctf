import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

class APIClient {
    public axios: AxiosInstance;

    constructor(axiosConfig: AxiosRequestConfig) {
        this.axios = Axios.create(axiosConfig);
    }

    public getUser(
        authToken: string,
    ): Promise<AxiosResponse<Record<string, unknown>>> {
        return this.axios.get<Record<string, unknown>>("/users/me", {
            headers: { authorization: `Bearer ${authToken}` },
        });
    }

    public addMarket(
        market: Record<string, unknown>,
        authToken: string,
    ): Promise<AxiosResponse<Record<string, unknown>>> {
        return this.axios.post<Record<string, unknown>>("/markets", market, {
            headers: { authorization: `Bearer ${authToken}` },
        });
    }
}

export default APIClient;
