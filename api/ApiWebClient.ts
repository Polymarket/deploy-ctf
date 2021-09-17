import { STRAPI_URL } from "../utils/network";
import APIClient from "./ApiClient";

export const APIWebClient = new APIClient({
    baseURL: STRAPI_URL,
    timeout: 60000,
});
