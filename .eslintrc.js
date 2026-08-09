/**
 * ESLint for the frontend.
 *
 * ADOPTED WITH RULES THAT ARE ALREADY TRUE, so `npm run lint` is green from the first
 * commit and any red is a regression in the change in front of you. Turning a linter on
 * late and inheriting a hundred violations teaches everyone to run it with `--fix` or not
 * at all.
 *
 * `next/core-web-vitals` is the base because it carries the React-hooks rules, which are
 * the ones that actually catch bugs in this codebase — a missing dependency in a `useMemo`
 * is how a filtered list silently stops updating.
 *

 * BASELINE ON ADOPTION: 0 errors, 10 warnings. The warnings are left ON, not silenced,
 * because all ten are real advisories rather than false alarms:
 *   9 × @next/next/no-img-element  — plain <img> for logos and avatars. Switching to
 *       next/image is a real change with real trade-offs (remote loader config, layout
 *       shift), not a lint cleanup, so it is a decision someone should make on purpose.
 *   1 × react-hooks/exhaustive-deps in admin/users — a logical expression that could
 *       change identity every render. Worth fixing; not worth doing blind.
 * `npm run lint` fails on errors and prints these. If the warning count climbs, that is
 * a signal, which it cannot be if the rules are off.
 *
 * WHAT IT CAUGHT ON DAY ONE: `NotificationBell` was imported in topnav.tsx and never
 * rendered, so the entire notification feature was unreachable from the app.
 *
 * `.eslintrc.js` rather than `.eslintrc.json` only so these notes can exist: JSON configs
 * reject a top-level comment key.
 */
module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'next/typescript'],
  ignorePatterns: ['.next/**', 'node_modules/**', 'out/**', '.eslintrc.js'],
  rules: {
    // `any` here is almost always a deliberate cast at an API boundary. Banning it would
    // buy a row of disable comments rather than any safety; `tsc --noEmit` is the real gate.
    '@typescript-eslint/no-explicit-any': 'off',

    // Leading underscore = deliberately unused.
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
    ],
  },
};
