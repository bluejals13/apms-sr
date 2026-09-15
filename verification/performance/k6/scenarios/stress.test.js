// scenarios/stress.test.js

import adminFlow from "./admin-flow.js";
import userFlow from "./user.flow.js";

export const options = {
    stages: [
      { duration: "1m", target: 50 },
      { duration: "2m", target: 100 },
      { duration: "1m", target: 200 },
    ]
};

export default function () {
    adminFlow()
    userFlow()
}
