// scenarios/user.flow.js

import { UserAPI } from "../api/user.api.js";

export default function (data) {
    const token = data.token;
    
    const res = UserAPI.getUsers(token);
    if (!res) console.log({
      method,
      path,
      tokenType: typeof token,
      bodyType: typeof body
    });
    
    return;
}
