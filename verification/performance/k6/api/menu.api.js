// k6/api/menu.api.js

import request from "../core/request.js";

export const MenuAPI = {
    getMenus: (token) => request("GET", "/api/admin/menus", null, token),

    createMenu: (token, data) =>
        request("POST", "/api/admin/menus", data, token),

    deleteMenu: (token, id) =>
        request("DELETE", `/api/admin/menus/${id}`, null, token),
};
