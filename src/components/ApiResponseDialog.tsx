import type { MdDialog } from '@material/web/dialog/dialog';
import { useRef } from 'react';
import Show from './Show';

/** A button that opens a dialog with the raw JSON response of an API endpoint. */
export default function ApiResponseDialog({
  icon,
  title,
  label,
  value,
}: {
  icon: string;
  title: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}) {
  const dialog = useRef<MdDialog>(null);

  return (
    <>
      <div className="flex flex-row">
        <div className="grow" />
        <md-filled-tonal-button onClick={() => dialog.current?.show()}>
          API response
        </md-filled-tonal-button>
      </div>

      <md-dialog ref={dialog}>
        <div slot="headline">
          <div className="flex items-center primary-text">
            <md-icon>{icon}</md-icon>
            <b>&nbsp;{title}</b>
          </div>
        </div>
        <div slot="content">
          <Show value={value} label={label} />
        </div>
        <div slot="actions">
          <md-text-button onClick={() => dialog.current?.close()}>Close</md-text-button>
        </div>
      </md-dialog>
    </>
  );
}
