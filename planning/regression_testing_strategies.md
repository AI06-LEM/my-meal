# Regression Testing Strategies for the Node.js MVP

Here are some recommendations on how to approach regression testing for the current prototype/MVP.

## Strategy 1 – Low-Effort, AI-Friendly Browser Journeys

- **Goal**: Cover the three most critical UX flows (admin upload, restaurant selection, guest voting) with minimal setup so regressions are caught before deployment.
- **Approach**:
  - Use Playwright’s `codegen` or Cypress Studio to record the manual browser journey, generate selectors/assertions, and rely on Cursor/GPT to refine when the UI shifts.
  - Keep the scripts as “living prompts”: describe scenario → record → let the tool update the spec whenever AI rewrites the UI.
  - Run as a simple npm script: `npx playwright test --project=chromium`.
- **Trade-offs**: Extremely fast to set up and resilient to backend refactors, but slower execution and limited insight into internal logic. Ideal as smoke tests before shipping.
- **Cursor-ready steps**:
  1. From the Cursor terminal run `cd /Users/torsten/texte/Bewerbungen/0_LEM/_LITe/Demos/my-meal && npm install`.
  2. Record or update a flow: `npx playwright codegen http://localhost:3000`.
  3. Save generated spec under `tests/browser/`.
  4. Re-run locally with `npx playwright test tests/browser/admin-upload.spec.ts`.
- **Usage example – Weekly flow sanity**:
  - Scenario: Validate the workflow in `SPECIFICATION.md` (setup → restaurant selection → guest voting).
  - Steps captured by Playwright: upload `meals_database.json`, pick weekly options, submit a guest vote, and assert that the results chart updates.
  - AI loop: When UI markup changes in `script.js`, re-run `codegen`, paste the snippet in Cursor, and let the model patch selectors/assertions.
- **Full test example** (`tests/browser/admin-upload.spec.ts`):

```ts
import { test, expect } from '@playwright/test';
import path from 'node:path';

const fixturesDir = path.resolve(__dirname, '../fixtures');

test('system admin uploads database and sees confirmation', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('tab', { name: 'System Admin' }).click();

  await page.setInputFiles('input[type="file"]', path.join(fixturesDir, 'meals_database.json'));
  await page.getByRole('button', { name: 'Upload Database' }).click();

  await expect(page.getByText('Meal database updated')).toBeVisible();
  await expect(page.getByRole('gridcell', { name: /Veggie Paella/i })).toBeVisible();
});
```

- **How to execute** (from repo root):
  1. `npm install`
  2. Start the MVP in another terminal: `npm run dev`
  3. `npx playwright test tests/browser/admin-upload.spec.ts`

## Strategy 2 – Industry-Standard API + E2E Coverage

- **Goal**: Balance speed and realism by layering route-level integration tests with a handful of end-to-end checks.
- **Approach**:
  - Use Jest with Supertest to exercise Express routes (uploads, selection, voting, plan generation) against a temporary SQLite file per run.
  - Seed fixtures using scripts in `scripts/`, run tests in parallel, and tear down the DB between tests.
  - Keep Playwright (or Cypress) for a couple of high-value end-to-end flows to ensure the browser/UI contract stays intact.
  - Wire everything into GitHub Actions (or similar CI) once stable, so every pull request/AI change gets automatic regression feedback.
- **Trade-offs**: Requires more plumbing (test DB, fixtures, CI config) but mirrors common Node.js practice and gives fast feedback on API regressions plus confidence in the UI.
- **Cursor-ready steps**:
  1. `npm install --save-dev jest supertest sqlite3`.
  2. Create a helper like `tests/api/testServer.js` that imports the Express app from `script.js`.
  3. Write Jest specs under `tests/api/*.test.js`. Use temporary SQLite files or in-memory JSON fixtures.
  4. Execute via Cursor terminal: `npx jest tests/api`.
- **Usage example – Duplicate vote guardrail**:
  - Bug reference: `BUGS.md` asks to "Prevent duplicate guest names from voting multiple times."
  - Test outline: send two POST requests to `/guest-vote` with the same name and check the second response is `409` with an explanatory message.
  - Extend suite with an Express route test ensuring `meal_plan.json` is written after `/generate-plan`, verifying the workflow in `SPECIFICATION.md`.
- **Full test example** (`tests/api/guestVotes.test.js`):

```js
const request = require('supertest');
const { buildApp } = require('../../script'); // expose buildApp() from script.js

describe('POST /guest-vote', () => {
  let app;

  beforeAll(() => {
    app = buildApp({
      storageDir: '__test_output__',
      weeklyOptionsPath: 'tests/fixtures/weekly_options.json',
    });
  });

  test('rejects duplicate guest names', async () => {
    const payload = {
      guestName: 'Clara',
      meat_option: 'Burger Combo',
      fish_option: 'Paella Combo',
      vegetarian_options: ['Mushroom Risotto', 'Veggie Paella'],
    };

    await request(app).post('/guest-vote').send(payload).expect(201);

    const res = await request(app).post('/guest-vote').send(payload).expect(409);
    expect(res.body.message).toMatch(/already voted/i);
  });
});
```

- **How to execute**:
  1. `npm install --save-dev jest supertest sqlite3`
  2. Ensure `module.exports = { buildApp }` (or similar) is exported from `script.js`.
  3. `npx jest tests/api/guestVotes.test.js`

## Strategy 3 – Property/Contract Regression Checks

- **Goal**: Encode invariants that stay true even when AI rewrites the implementation, catching subtle logic bugs.
- **Approach**:
  - Use `fast-check` with Jest to express properties such as “meal plans must contain one meat, one fish, two veg and no duplicates” or “duplicate votes are rejected”.
  - If the system splits into separate admin/guest services later, adopt Pact for consumer-driven contract tests so both sides stay in sync as APIs evolve.
- **Trade-offs**: Highest upfront learning curve, but properties/contracts rarely change when code is regenerated, so they provide durable regression protection.
- **Cursor-ready steps**:
  1. `npm install --save-dev fast-check`.
  2. Create `tests/properties/mealPlan.property.test.ts`.
  3. Import the plan generator from `script.js` and wrap it with `fc.assert`.
  4. Run via `npx jest tests/properties`.
- **Usage example – Meal plan invariants**:
  - Property derived from `SPECIFICATION.md`: every generated plan must consist of four unique days with 1 meat, 1 fish, 2 vegetarian dishes.
  - Use `fast-check` to randomly generate guest vote arrays and assert the invariants hold. Failures point directly to constraint bugs before they surface in UI.
  - Additional property from `BUGS.md`: removing `dietary_info` should not break serialization; assert that plan objects remain JSON-serializable after stripping the field.
- **Full test example** (`tests/properties/mealPlan.property.test.ts`):

```ts
import { test, expect } from '@jest/globals';
import fc from 'fast-check';
import { buildMealPlan } from '../../script';

test('plan has 1 meat, 1 fish, 2 vegetarian meals', () => {
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          guestName: fc.string({ minLength: 3, maxLength: 12 }),
          meat_option: fc.constantFrom('burger_combo'),
          fish_option: fc.constantFrom('paella_combo'),
          vegetarian_options: fc.constantFrom(['veg_lasagna', 'tofu_curry']),
        }),
        { minLength: 5, maxLength: 30 }
      ),
      votes => {
        const plan = buildMealPlan(votes);
        const selections = Object.values(plan);
        expect(new Set(selections).size).toBe(selections.length);
        expect(selections.filter(id => id.includes('burger'))).toHaveLength(1);
        expect(selections.filter(id => id.includes('paella'))).toHaveLength(1);
        expect(selections.filter(id => id.includes('veg'))).toHaveLength(2);
      }
    ),
    { verbose: true }
  );
});
```

- **How to execute**:
  1. `npm install --save-dev jest fast-check`
  2. Ensure `buildMealPlan` (pure function that returns the weekly plan object) is exported from `script.js`.
  3. `npx jest tests/properties/mealPlan.property.test.ts`

## On Integration vs Unit Tests in an AI-Heavy Workflow

- I agree with the intuition that higher-level tests (HTTP routes + UI flows) survive AI-led rewrites much better than a blanket of implementation-level unit tests.
- Keep a *thin* layer of targeted unit/property tests around critical pure logic (meal-plan generation, vote validation) because they execute quickly and localize failures.
- Build the main safety net with route-level API tests plus a handful of browser journeys; refactors rarely break these unless observable behavior changes, which is the right failure mode.

## Referenced Tools & Frameworks

| Tool | URL | Short Description |
| --- | --- | --- |
| Playwright | https://playwright.dev | Cross-browser E2E framework by Microsoft; includes `codegen` to record user journeys and output test scripts. |
| Cypress Studio | https://docs.cypress.io/guides/core-concepts/cypress-studio | Cypress feature that records interactions/assertions via the browser, ideal for quick UI regression specs. |
| Jest | https://jestjs.io | De facto Node.js testing framework; great runner/assertion library for unit and integration tests. |
| Supertest | https://github.com/ladjs/supertest | HTTP assertion library that plugs into Jest to test Express apps without starting a real server. |
| Playwright Test Runner | https://playwright.dev/docs/test-intro | Built-in runner for Playwright suites; handles browsers, parallelism, traces, screenshots. |
| GitHub Actions | https://github.com/features/actions | CI platform that runs your Jest/Playwright suites on every push or pull request. |
| fast-check | https://dubzzz.github.io/fast-check.github.com/ | Property-based testing library for JS/TS (similar to the Python framework Hypothesis); generates randomized inputs to ensure invariants hold. |
| Pact | https://pact.io | Consumer-driven contract testing framework; ensures services obey agreed request/response contracts. |

> *Non-test-specific assistants (Cursor/GPT) are still helpful for regenerating test specs, but the table focuses on dedicated testing technologies as requested.*


