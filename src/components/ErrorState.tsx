import { useState } from "react";
import { AlertCircleIcon } from "./icons/icons";
import { Button } from "./Button";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  title: string;
  description?: string;
  detail?: string;
  onRetry?: () => void;
  recoverable?: boolean;
}

export function ErrorState({ title, description, detail, onRetry, recoverable = true }: ErrorStateProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className={styles.wrapper} role="alert">
      <div className={styles.icon}>
        <AlertCircleIcon size={24} />
      </div>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.actions}>
        {recoverable && onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
        {detail && (
          <Button variant="ghost" onClick={() => setShowDetail((v) => !v)}>
            {showDetail ? "Hide details" : "Technical details"}
          </Button>
        )}
      </div>
      {showDetail && detail && <pre className={styles.detail}>{detail}</pre>}
    </div>
  );
}
