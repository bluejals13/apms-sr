// scenarios/load.test.js

import userFlow from "./user.flow.js";
import readFlow from "./read.flow.js";
import adminFlow from "./admin-flow.js";

//import { thresholds } from "../config/thresholds.js";

export const options = { vus: 50,
    duration: "2m",
//    thresholds,
};

export default function () {
    const token = login();
    
    userFlow({ token });
    readFlow({ token });
    adminFlow({ token });  
}
