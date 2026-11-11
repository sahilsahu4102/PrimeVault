import useServerStatus from '../../hooks/useServerStatus';
import { StateMark } from './Marks';

/** The demo API sleeps when idle. This says what it is doing, instead of leaving a button to hang. */
export default function ServerStatus() {
  const { status, retry } = useServerStatus();

  if (status === 'ready') {
    return (
      <p className="state-line" role="status">
        <StateMark kind="ready" /> Demo server: ready
      </p>
    );
  }

  if (status === 'checking') {
    return (
      <p className="state-line" role="status">
        <StateMark kind="waking" /> Checking the demo server
      </p>
    );
  }

  if (status === 'waking') {
    return (
      <div className="notice is-wait" role="status">
        <StateMark kind="waking" />
        <div>
          <b>The demo server is waking up</b>
          <p>It sleeps when idle, so the first request can take about a minute. You can already press the buttons; they will finish once it is up.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notice is-error" role="alert">
      <StateMark kind="down" />
      <div>
        <b>Could not reach the demo server</b>
        <p>Check your connection, then try again.</p>
        <p style={{ marginTop: 8 }}><button type="button" className="btn btn-sm" onClick={retry}>Try again</button></p>
      </div>
    </div>
  );
}
