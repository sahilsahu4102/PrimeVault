import { DOCS_URL } from '../../services/api';

const FACTS = [
  ['Sign-in', 'A short-lived access token, renewed quietly from an httpOnly refresh cookie.'],
  ['Roles', 'USER and ADMIN. You edit your own assets; admins can edit anyone’s.'],
  ['Checks', 'The server validates every request, and its messages appear in the forms.'],
];

/** Left half of the sign-in and sign-up pages: what this is, in plain facts about the API. */
export default function AuthPoster() {
  return (
    <section className="poster" aria-label="About PrimeVault">
      <span className="wordmark">PrimeVault</span>
      <h1>A crypto asset manager, built on a REST API.</h1>
      <ul className="facts">
        {FACTS.map(([term, text]) => (
          <li key={term}><b>{term}</b><span>{text}</span></li>
        ))}
        <li>
          <b>Docs</b>
          <span>The API is documented in Swagger: <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">open the API docs</a>.</span>
        </li>
      </ul>
      <p className="foot">
        A backend assignment project: the API is the main work, and this client shows that it works.{' '}
        <a href="https://github.com/sahilsahu4102/PrimeVault" target="_blank" rel="noopener noreferrer">Source on GitHub</a>.
      </p>
    </section>
  );
}
