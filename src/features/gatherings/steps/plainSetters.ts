/**
 * A form type with every function member narrowed to `(value) => void`, the
 * way the field components call their setters.
 *
 * A `useState` setter takes a value or an updater; the field components only
 * ever pass a value. Narrowing the member lets a plain callback over a
 * reducer's `dispatch` satisfy the same type, and every `useState` setter
 * still does too. Members that are not functions keep their type.
 */
export type PlainSetters<Form> = {
  [Key in keyof Form]: Form[Key] extends (value: infer Argument) => void
    ? (value: Exclude<Argument, (...args: never[]) => unknown>) => void
    : Form[Key];
};
