/** The text field a placeholder chip inserts into: whichever one the admin
 *  focused last (a subject, a block field, or the code editor). */
export interface ActiveField {
  insert: (token: string) => void;
}

export type FocusFieldHandler = (field: ActiveField) => void;
