import type { RequestError } from '../lib/solar';
import Expandable from './Expandable';

/** Always expanded error card with a retry button. */
export default function RequestErrorCard({
  title,
  endpoint,
  detail = '',
  error,
  onRetry,
}: {
  title: string;
  endpoint: string;
  detail?: string;
  error: RequestError;
  onRetry: () => void;
}) {
  return (
    <div className="error-container on-error-container-text">
      <Expandable
        icon="error"
        title={title}
        subtitle={error.error.status}
        expanded={true}
        onToggle={() => {}}
      >
        <div className="grid place-items-center py-2 space-y-4">
          <div className="grid place-items-center">
            <p className="body-medium">
              Error on <code>{endpoint}</code> {detail} request
            </p>
            <p className="title-large">ERROR {error.error.code}</p>
            <p className="body-medium">
              <code>{error.error.status}</code>
            </p>
            <p className="label-medium">{error.error.message}</p>
          </div>
          <md-filled-button onClick={onRetry}>
            Retry
            <md-icon slot="icon">refresh</md-icon>
          </md-filled-button>
        </div>
      </Expandable>
    </div>
  );
}
