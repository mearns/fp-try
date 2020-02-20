import Try from "./core";
import unary, { Unary } from "./unary";

/**
 * Exports the `Try` type, but augmented with the `unary` property.
 */
export default abstract class ExtendedTry<T> extends Try<T> {
    /**
     * A convenience property providing access to the unary operators.
     */
    static unary: Unary = unary;
}
