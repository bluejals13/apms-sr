// k6/api/user.api.js

import request from "../core/request.js";

export const UserAPI = {
    getUsers: (token) =>
        request("GET", "/api/admin/users", 
                null, token, 
                { tags: { api: "getUsers" } } ),

    changeStatus: (token, id, status) =>
        request("PATCH", `/api/admin/users/${id}/status`, 
                { status }, token, 
                { tags: { api: "changeStatus" } } ),

    deleteUser: (token, id) =>
        request("DELETE", `/api/admin/users/${id}`, 
                null, token, 
                { tags: { api: "deleteUser" } } ),
};
