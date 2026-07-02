import { FormField } from "../../shared/components/ui";
import { PW_MIN, STRENGTH_COLORS, STRENGTH_LABELS } from "./createAccount.data";
import styles from "./auth.module.css";

type Touched = {
  first: boolean;
  last: boolean;
  password: boolean;
  confirm: boolean;
};

interface AccountFieldsProps {
  first: string;
  setFirst: (v: string) => void;
  last: string;
  setLast: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirm: string;
  setConfirm: (v: string) => void;
  score: number;
  touched: Touched;
  touch: (key: keyof Touched) => void;
  errors: Partial<Record<keyof Touched, string>>;
}

export function AccountFields({
  first,
  setFirst,
  last,
  setLast,
  password,
  setPassword,
  confirm,
  setConfirm,
  score,
  touched,
  touch,
  errors,
}: AccountFieldsProps) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>Your account</div>
      <div className={styles.twoCol}>
        <FormField
          label="First name"
          required
          error={touched.first ? errors.first : undefined}
        >
          <input
            type="text"
            placeholder="Tiago"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            onBlur={() => touch("first")}
            aria-invalid={touched.first && !!errors.first}
          />
        </FormField>
        <FormField
          label="Last name"
          required
          error={touched.last ? errors.last : undefined}
        >
          <input
            type="text"
            placeholder="Costa"
            value={last}
            onChange={(e) => setLast(e.target.value)}
            onBlur={() => touch("last")}
            aria-invalid={touched.last && !!errors.last}
          />
        </FormField>
      </div>
      <FormField
        label="Email address"
        helper="Taken from your invite — not editable"
      >
        <input type="email" value="tiago@gmail.com" disabled />
      </FormField>
      <div className={styles.field}>
        <label>
          Password <span className={styles.req}>*</span>
        </label>
        <input
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => touch("password")}
          aria-invalid={touched.password && !!errors.password}
        />
        <div className={styles.strengthBar}>
          {[1, 2, 3, 4].map((seg) => (
            <div
              key={seg}
              className={styles.strengthSeg}
              style={{
                background: seg <= score ? STRENGTH_COLORS[score] : undefined,
              }}
            />
          ))}
        </div>
        {touched.password && errors.password ? (
          <div className={styles.fieldError}>{errors.password}</div>
        ) : (
          <div
            className={styles.strengthLabel}
            style={{ color: STRENGTH_COLORS[score] }}
          >
            {STRENGTH_LABELS[score]}
          </div>
        )}
        <div className={styles.helper}>
          At least {PW_MIN} characters. Add numbers or symbols for a stronger
          password.
        </div>
      </div>
      <FormField
        label="Confirm password"
        required
        error={touched.confirm ? errors.confirm : undefined}
        ok={
          touched.confirm && !errors.confirm && confirm
            ? "Passwords match."
            : undefined
        }
      >
        <input
          type="password"
          placeholder="Confirm your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => touch("confirm")}
          aria-invalid={touched.confirm && !!errors.confirm}
        />
      </FormField>
    </div>
  );
}

export type { Touched };
