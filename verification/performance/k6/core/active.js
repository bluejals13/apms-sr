// k6/core/active.js		행위 혹은 작업

import { UserAPI } from "../api/user.api.js";

export default function ({ token }) {
    const res = UserAPI.getUsers(token);

    if (res.status !== 200) { console.error(`getUsers failed: ${res.status}`);
        return;
    }

    const users = res.json();

    if (!users?.length) { return; }
    
    const statuses = ["ACTIVE", "SUSPENDED"];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    const nextStatus = randomUser.status === "ACTIVE"    ? "SUSPENDED" : "ACTIVE";
    
    UserAPI.changeStatus(token, randomUser.id, "ACTIVE");
}
