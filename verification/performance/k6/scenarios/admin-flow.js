// scenarios/admin-flow.js

import { sleep } from "k6";
import { UserAPI } from "../api/user.api.js";
import { MenuAPI } from "../api/menu.api.js";

function Domenu() {
    const Lists = [
        "Americano",
        "Latte",
        "Cappuccino",
        "Mocha",
        "Espresso",
        "Macchiato",
        "Cold Brew"
    ];

    const name = Lists[Math.floor(Math.random() * Lists.length)];
    const price = Math.floor(Math.random() * 5000) + 3000;

    return { name, price };
}

export default function (data) {
    // 1. 사용자 조회
    const token = data.token;

    if (!token) {
        console.error("missing token");
        return;
    }

    const res = UserAPI.getUsers(token);

    if (res.status !== 200) {
        console.error(`getUsers failed: ${res.status}`);
        return;
    }

    let users;

    try {
        users = res.json("data");
    } catch (e) {
        console.error("Invalid JSON response");
        return;
    }

    if (!users || users.length === 0) {
        console.error("No users found");
        return;
    }

    const userId = users[0].id;

    sleep(1);

    // 2. 상태 변경
    const res2 = UserAPI.changeStatus(token, userId, "ACTIVE");

    if (res2.status !== 200) {
        console.error(`changeStatus failed: ${res2.status}`);
    }

    sleep(1);

    // 3. 메뉴 생성
    const menu = Domenu();

    const res3 = MenuAPI.createMenu(token, menu);

    if (![200, 201].includes(res3.status)) {
        console.error(`createMenu failed: ${res3.status}`);
        return;
    }

    // 생성된 메뉴 조회
    const listRes = MenuAPI.getMenus(token);

    if (listRes.status !== 200) {
        console.error(`getMenus failed: ${listRes.status}`);
        return;
    }

    const menus = listRes.json("data");

    if (!Array.isArray(menus)) {
        console.error("Invalid menus data");
        return;
    }

    const created = menus.find(
        m => m.name === menu.name && m.price === menu.price
    );

    if (!created) {
        console.error("Not find createMenu");
        return;
    }

    // 4. 메뉴 삭제
    const deleteRes = MenuAPI.deleteMenu(token, created.id);

    if (![200, 204].includes(deleteRes.status)) {
        console.error(`deleteMenu failed: ${deleteRes.status}`);
    }
}