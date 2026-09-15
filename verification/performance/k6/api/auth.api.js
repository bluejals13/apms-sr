// k6/api/auth.api.js

import http from "k6/http";
import { config } from "../config/env.js";
//import { setToken } from "../core/auth.js";

const BASE_URL = config.baseUrl;

export function login(username, password) {
    const res = http.post(`${BASE_URL}/api/auth/login`,
        JSON.stringify({ username, password }),
        { headers: { "Content-Type": "application/json" } }
    );

    //console.log(res.json());
    
    return res;
}
