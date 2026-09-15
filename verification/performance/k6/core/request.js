// k6/core/request.js		통신규격

import http from "k6/http";
import { config } from "../config/env.js";

export default function request(method, path, body = null, token, options = {}) {
    
    if (!config.baseUrl) { throw new Error("BASE_URL is not defined"); }
    
    const payload = body ? JSON.stringify(body) : null;
    
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}`, }),
        ...(options.headers ?? {}),
    };
    
    const timeout = options.timeout ?? "30s";
    
    //console.log("AUTH HEADER:", token);
    
    return http.request(method, `${config.baseUrl}${path}`, payload, { tags: options.tags || {}, headers, timeout,} );
}
