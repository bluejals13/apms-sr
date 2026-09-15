// scenarios/spike.test.js

import readFlow from "./read.flow.js";

export const options = {
    stages: [
        { duration: "10s", target: 10 },
        { duration: "10s", target: 200 },
        { duration: "30s", target: 10 },
    ],
};

export default function () {
    readFlow(); // spike는 read 중심이 정상
}
