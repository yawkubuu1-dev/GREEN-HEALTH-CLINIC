# Gemini consultation FAQ test

This is an isolated test of Gemini with one approved, non-identifying sample FAQ. It does not connect to WhatsApp, accept user-written prompts, store conversations, or send messages. Do not expand the test to real patient messages while using the Gemini free tier.

The function requires a private test token. The Gemini API key and test token stay in Supabase Edge Function secrets and must never be added to the Expo app or `.env` file.

## 1. Create a Gemini API key

Create a key in Google AI Studio and check the current Gemini API pricing and data-use terms for the selected account/model before using it. The free tier may use submitted content to improve Google products; this test therefore sends only a fixed sample question and approved, general answer.

## 2. Configure and deploy the function

From the project root, link the Supabase CLI to the clinic's project, then set the key and deploy:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY GEMINI_TEST_TOKEN=PASTE_THE_GENERATED_TOKEN
supabase functions deploy gemini-consultation-faq-test
```

Use the generated token only in the dashboard test request header. Keep both values private. If either has ever been pasted into source code, chat, or a public client, revoke/rotate it.

## 3. Run the test

Use the Supabase Dashboard's Edge Functions invocation tester to call `gemini-consultation-faq-test`. Add this header:

```text
x-gemini-test-token: YOUR_GENERATED_TEST_TOKEN
```

Send this JSON body:

```json
{
  "sampleId": "consultation_request"
}
```

The function accepts only that fixed sample ID. A successful response contains `testOnly: true` and Gemini's generated FAQ wording. It never sends the response to WhatsApp.

## Before enabling WhatsApp replies

This test is not the live bot. A production WhatsApp webhook needs Meta Cloud API credentials and signature verification, replay/duplicate protection, strict message limits, explicit human handoff, and reviewed privacy terms for every AI provider. Do not connect real health conversations to the Gemini free tier. The clinic must also approve the FAQ source and safety/escalation wording before any automatic replies are enabled.
