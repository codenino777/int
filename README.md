# AI Interview Coach

English interview practice with microphone speech recognition and real OpenRouter AI answers. No hardcoded answers.

## Run locally (computer)

1. Install Node.js 18+.
2. Copy `.env.example` to `.env` and enter your OpenRouter API key.
3. Start using `node --env-file=.env server.js` (Node.js 20.6+), or set environment variables through your shell and run `npm start`.
4. Open `http://localhost:3000` in Chrome on the same computer.

## Use on Android

Deploy this Node app to a host supporting Node.js (for example Render web service). Push these files to a **private** GitHub repository (never commit `.env`). Set `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, and `APP_PIN` as environment variables in the hosting dashboard. Build command: none. Start command: `npm start`. Open the host's **HTTPS** URL in Android Chrome, enter APP_PIN, tap Start and grant microphone permission.

**Important:** Android Chrome speech recognition support and continuous listening vary by device/browser. Keep the page open and screen awake. Browser recognition may use an external speech service. It may restart between phrases. If unavailable, type the question and tap Generate AI answer. For best results, the interviewer should pause after each question and avoid speaking while the candidate answers.

## Security and cost

API key remains server-side. APP_PIN protects the endpoint with a basic shared secret; for a public multi-user app, add proper authentication and stronger rate limiting. API calls may incur OpenRouter charges; choose your model and spending limits on OpenRouter. This is for practice, not covert assistance in real assessments.
