const http = require('http');

const payload = JSON.stringify({
  date: '2026-09-04',
  answers: {
    A1: '25–34',
    A2: 'Female',
    A3: "Master's",
    A4: 'Programme/Project management',
    A5: '4–7',
    A6: '26–50',
    A7: ['Education', 'Women/gender'],
    A8: '51–75%',
    B1: 'Weekly',
    B2: ['ChatGPT', 'Gemini'],
    B3: '4',
    B4: '4 Very',
    B5: ['Writing', 'Research'],
    F1: 'Daily',
    F2: ['Writing/editing', 'Reports'],
    F3: '3–5 hrs',
    F4: 'Significantly improved',
    F5: 'Yes, many',
    F6: 'Somewhat',
    F7: 'Yes',
    F7_description: 'Integrated AI grant proposal drafter for education team',
    G6: 'Yes',
    G7: 'Partially',
    G8: 'Occasionally',
    G9: 'Never',
    H1: 'Very',
    H2: 'Often',
    H3: ['Web search', 'Primary documents'],
    H4: 'Much more',
    I1: 'C. Verify it against an authoritative/primary source',
    I2: 'C. Specify role, context, task, constraints and what needs verification',
    I3: 'B. Remove/anonymise sensitive information and assess tool suitability',
    I4: 'B. AI produces plausible but false information',
    I5: 'B. Investigate data/model/process for potential bias',
    I6: 'B. Human remains responsible for evaluating consequential outputs',
    I7: 'C. Deciding whether a vulnerable person receives a critical social benefit',
    I8: 'C. It should still be independently checked',
    I9: "C. Use AI for value while managing risks, oversight and affected people's rights",
    I10: 'C. What benefits, risks, affected rights and accountability mechanisms are involved?',
    K1: 'Yes, significantly',
    K2: ['Translation', 'Simplifying language'],
    K3: '5 Strongly agree',
    K4: '4',
    K5: ['Rural communities', 'Low-income communities'],
    L1: 'Being developed',
    L2: 'Yes',
    L3: 'Partially',
    L4: 'Yes',
    M0: '9',
    M1: '5',
    M2: '5',
    M3: '4',
    M4: '5',
    M5: '5',
    M6: '5',
    M7: '5',
    M8: '5',
    O1: ['Do it manually', 'Search Google'],
    O2: 'Mostly AI + human review',
    O3: ['Grant writing', 'Translation'],
    P1: 'How fast AI can synthesize complex field survey data into clear insights.',
    P2: 'Automated multilingual translation and custom grant proposal drafting.',
    P3: 'AI hallucinated a non-existent government notification citation.',
    P4: 'Yes, now we strictly anonymize all beneficiary names before prompting.',
    P5: 'Yes, realized that unverified AI predictions can bias resource allocation.',
    P6: 'Automated proposal drafting and beneficiary report summarization.',
    P7: 'Entering confidential community data into unverified public tools.',
    P8: 'Lack of formal AI policy and structured team training.',
    P9: 'Clear beneficiary privacy and data classification policy.',
    P10: 'Advanced Prompt Engineering for NGO Grant Writing.',
    P11: 'Claude 3.5 Sonnet, Perplexity Pro, and custom RAG databases for NGOs.',
    P12: 'Manual transcription of audio field interviews and budget tracking reconciliations.',
    Q1: 'Both; benefits outweigh risks',
    Q2: 'Because efficiency gains are massive if ethics and human oversight are strictly enforced.',
    R1: 'I agree',
    R2: 'Yes'
  }
});

const req = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/api/survey',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log('HTTP Status:', res.statusCode);
      console.log('Response Body:', body);
    });
  }
);

req.on('error', (err) => console.error('Error:', err.message));
req.write(payload);
req.end();
