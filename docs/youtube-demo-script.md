# VeriVenture Demo Video Script

This script outlines a 7–8 minute walkthrough of VeriVenture. Each voice-over line is paired with the visual or interaction the audience should see at that moment.

---

## Segment 1 – Home Hero & Connect Wallet

1. **On-screen:** Start recording with the homepage (`/`) visible and no prior navigation. Slowly move the mouse across the hero title and subtitle, then move the cursor to the `Connect Wallet` button in the header or hero, click it, approve the connection in the Polkadot/Talisman extension, and wait until the UI clearly shows you as connected.
   - **Voice-over 1:** “Welcome to VeriVenture, the entrepreneur OS that helps you get paid faster, prove your traction with real proofs, and share a verification page that buyers and investors can trust. I start by connecting my wallet to sign in—no passwords, just my wallet identity.”

## Segment 2 – Passport & Handle

1. **On-screen:** From the homepage, navigate to the Passport page (for example `/passport` or your Passport/Profile page). Show your current handle in the handle field, such as `syntaxsurge`. Hover or click the edit icon so the warning about changing the handle is clearly visible, then cancel without changing anything.
   - **Voice-over 2:** “Next I go to my Passport, where I’ve already claimed my username, in this case @syntaxsurge. This handle controls my public verify URL. I can change it later, but as you can see in the warning, changing a handle will update my /verify link and may break older links that I’ve already shared, so once I start using this link in emails and proposals I treat the handle as stable.”

## Segment 3 – Add Credential

1. **On-screen:** Navigate from the dashboard to `/credentials`. Click the `New Credential` or `Add Achievement` button.
2. **On-screen:** In the Title field, type `First 5 paying customers` and in the Description field type a short hint such as `Closed our first 5 customers in November`, then click the `Use AI` button next to the Description so the assistant expands that hint into a fuller sentence. Set the Date to today, show the computed hash or verifiable hash if it appears, then click `Mint on chain` or `View on blockchain` if your UI allows it and briefly open the block explorer tab to show the transaction.
   - **Voice-over 3:** “Credentials let me turn key milestones into verifiable records. For this demo I just type the milestone title and a short hint, then use the `Use AI` button to let the assistant write the full description before minting an on-chain badge. That gives me a permanent proof of the milestone with a blockchain link I can reuse later in my profile or in my deck.”

## Segment 4 – Pitch Deck Studio

1. **On-screen:** Navigate to AI Assistant → Pitch Deck to open `/ai-assistant/pitch-deck`.
2. **On-screen:** In the `Startup name` field, type `Summit Flow Analytics` and leave the other fields mostly blank, then click a `Use AI` button next to the remaining fields so the assistant generates their content from that single startup name. Once the key fields are populated, click `Generate Deck`.
3. **On-screen:** When generation finishes, open the generated deck workspace with slide thumbnails, then briefly show an export menu for PDF or PPTX.
   - **Voice-over 4:** “To prepare for investors I open the pitch deck studio. I seed it with my company name and just a few words about my mission, then click `Use AI` so the assistant drafts the detailed wording for me. When I click generate, VeriVenture creates a structured deck I can refine and export to PDF or PowerPoint, so even if I’m not a designer I can get an investor-ready deck in minutes.”

## Segment 5 – Business Plan & Resume

1. **On-screen:** From the pitch deck studio, navigate back to the AI Assistant hub (`/ai-assistant`).
2. **On-screen:** Briefly open the Business Plan page at `/ai-assistant/business-plan`. In the main idea or company field, type a short idea name or one-sentence concept, then click the `Use AI` button so the assistant generates the plan sections from that minimal input. Scroll to reveal at least one generated section.
3. **On-screen:** Then open the Resume page at `/ai-assistant/resume`. In the role or headline field, type something like `Climate fintech founder`, then click a `Use AI` button on the summary so the AI writes a profile based on that title, and show the generated summary.
   - **Voice-over 5:** “The same AI hub also gives me a business plan writer and a resume builder. I only need to type a simple idea or role title, then I click `Use AI` and let the assistant fill in the narrative for me—and all of these AI-generated documents will be available later in the Documents area.”

## Segment 6 – Create Invoice

1. **On-screen:** Navigate to `/invoices` and click `New Invoice` to open the invoice creation form at `/invoices/new`.
2. **On-screen:** Fill in the client name or label, leave the client wallet address field empty so any wallet can pay, add one or two line items with amounts and a due date, and make sure the “Publish proof to DKG” toggle is off at creation if your UI has it. Click `Create Invoice` or `Save & Share` and wait for the invoice detail page to load, then copy the public invoice link from this page.
   - **Voice-over 6:** “Now I’ll send an invoice. I don’t need the client’s wallet address upfront—anyone with the public invoice link can pay. I set the client label, line items, and due date, create the invoice, and I get a public link that I can drop into email, Slack, or a message. Notice that at this step I am not publishing anything to the DKG yet; creation is private until the invoice is actually paid.”

## Segment 7 – Client Pays Invoice

1. **On-screen:** Open an incognito window or a different browser with a separate wallet. Paste the invoice link into the address bar and load the public invoice page.
2. **On-screen:** On the public invoice view, click `Pay invoice` and complete the payment using a test wallet, or, if payment rails are mocked in your environment, click a `Mark as Paid` button that simulates payment.
   - **Voice-over 7:** “This is what my client sees when they open the invoice link—a clear summary and a single action to pay. They don’t have to create an account; they can simply pay with their wallet or through whatever payment option I’ve configured, and the status will update on my side.”

## Segment 8 – Publish Payment Proof

1. **On-screen:** Go back to your main browser and refresh the invoice detail page at `/invoices/[invoiceId]`.
2. **On-screen:** Show that the invoice is now marked as `Paid` or `Settled`. Click the button or toggle that says `Publish payment proof to DKG` or similar. Wait for the DKG call to complete, then show the returned UAL and any `View on DKG Explorer` link.
   - **Voice-over 8:** “Back on my side, the invoice is now marked as paid. This is the moment it makes sense to publish a proof. When I click ‘Publish payment proof to DKG’, VeriVenture sends a minimal, hashed version of the receipt and the transaction reference to the OriginTrail DKG. The DKG returns a UAL—a permanent identifier—that anyone can inspect in the explorer to independently verify that this payment event exists, without seeing all the line-item details.”

## Segment 9 – Proofs & Audit Log

1. **On-screen:** Navigate to the Proofs or Proofs & Audit Log page (for example `/proofs`).
2. **On-screen:** Show the newly created proof entry for the paid invoice with its UAL and chain transaction link. Click a toggle such as `Feature on Profile` for that payment proof, and feature one credential proof as well if your UI supports it.
   - **Voice-over 9:** “All of my proofs live in the Proofs and Audit Log area. Here I can see the payment proof I just published, along with its DKG UAL and chain transaction link. I can choose which items I want to feature on my public profile—for example, this settled invoice and my key milestone credentials—so my verify page shows the highlights instead of everything.”

## Segment 10 – Documents Vault

1. **On-screen:** Navigate to `/documents`.
2. **On-screen:** Highlight the pitch deck and business plan entries that were generated earlier using the AI tools. Open the pitch deck entry and show the `Preview` or `Download` buttons.
   - **Voice-over 10:** “The Documents page is my archive of AI-generated artefacts—pitch decks, business plans, resumes, and other content. I can re-open any document that I created with a single prompt and a `Use AI` click, or download it as a PDF or PPTX for email or data room uploads.”

## Segment 11 – Claim Checker / Truth Alignment

1. **On-screen:** Navigate to AI Assistant → Claim Checker, for example `/ai-assistant/truth`.
2. **On-screen:** In the main claim field, type a real example such as `We reduced onboarding time by 40% in Q3 2025.` In the sources section, add at least one URL, such as a case study page on your site or a report URL. Click `Analyze` and wait for the results.
3. **On-screen:** Briefly scroll past the Similarity score, Missing topics, and Unique claims sections. Click `Publish Community Note` and show the resulting UAL and `View on DKG Explorer` link.
   - **Voice-over 11:** “Claim Checker is for statements that matter—like traction claims, ESG metrics, or certifications. I paste my claim, link to my evidence, and ask the assistant to analyze it. It highlights differences between my claim and the sources I provided, and suggests what I might be missing. When I’m comfortable with the wording, I publish a Community Note to the DKG. That note is a signed, timestamped explanation of the claim with citations, and the UAL becomes a link I can use in decks, on landing pages, or in procurement documents to give reviewers more confidence.”

## Segment 12 – Public Verify Page

1. **On-screen:** Navigate to your public verify URL, for example `/verify/syntaxsurge`.
2. **On-screen:** At the top of the page, show the handle, display name, and any trust score or summary row. Scroll through the sections: featured paid invoice proofs with `View tx` links, credentials with `View on chain` or `Copy hash`, and Community Notes with `View on DKG Explorer`. Pause briefly on each type of proof.
   - **Voice-over 12:** “My public verify page pulls all of this together. At the top you see my handle and a quick summary, and below that the proofs I chose to feature: settled invoices with transaction links, on-chain credentials for major milestones, and DKG Community Notes for sensitive claims. Investors, buyers, and partners don’t have to take my word for it—they can click through to the chain explorer or the DKG explorer and verify everything themselves.”

## Segment 13 – Closing on Home

1. **On-screen:** Navigate back to the homepage (`/`). Slowly scroll just enough to reveal the hero title and one or two key feature cards again.
   - **Voice-over 13:** “That’s how VeriVenture works end-to-end: create invoices any client can pay, generate investor-ready documents with AI, mint and publish proofs only when they add value, and share a single verify link that turns your story into something people can click to trust.”
