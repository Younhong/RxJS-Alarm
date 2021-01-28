// Example for a snoozable alarm clock, lovingly ripped off from:
// John Lindquist's RxJS with Vue https://www.youtube.com/watch?v=_74d-NdeqOI
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { of, interval, concat, Subject } from 'rxjs';
import {
  takeWhile,
  takeUntil,
  scan,
  startWith,
  repeatWhen,
  share,
  filter,
} from 'rxjs/operators';
import './index.css';

const countdown$ = interval(250)
  .pipe(
    startWith(60),
    scan(time => time - 1),
    takeWhile(time => time > 0)
  )
  .pipe(share());

const actions$ = new Subject();
const snooze$ = actions$.pipe(filter(action => action === 'snooze'));
const dismiss$ = actions$.pipe(filter(action => action === 'dismiss'));

const snoozeableAlarm$ = concat(countdown$, of('Wake up! 🎉')).pipe(
  repeatWhen(() => snooze$)
);

const observable$ = concat(
  snoozeableAlarm$.pipe(takeUntil(dismiss$)),
  of('Have a nice day! 🤗')
);

function App() {
  const [state, setState] = useState();
  useEffect(() => {
    const sub = observable$.subscribe(setState);
    return () => sub.unsubscribe();
  }, []);

  return (
    <>
      <h3>Alarm Clock</h3>
      <div className="display">{state}</div>
      <button className="snooze" onClick={() => actions$.next('snooze')}>
        Snooze
      </button>
      <button className="dismiss" onClick={() => actions$.next('dismiss')}>
        Dismiss
      </button>
    </>
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
