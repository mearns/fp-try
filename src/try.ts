import Core from "./core";
import unary, { Unary } from "./unary";

type CoreTry = typeof Core;
interface Try extends CoreTry {
    unary: Unary;
}

const Try: Try = Object.assign(Core, { unary });
export default Try;
