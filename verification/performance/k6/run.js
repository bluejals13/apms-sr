// k6/run.js

import flow from "./core/active.js";
import { setup } from "./setup.js";

import admin from "./scenarios/admin-flow.js";
import user from "./scenarios/user.flow.js";
import read from "./scenarios/read.flow.js";
import load from "./scenarios/load.test.js";

export { setup };

// 환경변수로 시나리오 선택
//const SCENA = __ENV.SCENA || "1"
//const scenario = __ENV.scenario || "user"
//const flows = { admin, user, read, load };

export default function (data) {

    const stage = __ENV.STAGE || "normal";

    const ratioMap = {
        warmup: { user: 0.9, read: 0.1, admin: 0 },
        normal: { user: 0.7, read: 0.27, admin: 0.03 },
        stress: { user: 0.5, read: 0.4, admin: 0.1 },
    };

    const ratio = ratioMap[stage] || ratioMap.normal;
    const userRatio = ratio.user;
    const readRatio = ratio.read;

    const r = Math.random();

    if (r < userRatio) user(data);
    else if (r < userRatio + readRatio) read(data);
    else admin(data);

    // flows[scenario](data);
}

export const options = {
  systemTags: ["method", "url", "status"],
};