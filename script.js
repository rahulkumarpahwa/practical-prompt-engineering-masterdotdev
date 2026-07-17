const SOURCES = [
  {
    label: "OpenAI Prompt Engineering Guide",
    url: "https://platform.openai.com/docs/guides/prompt-engineering",
  },
  {
    label: "Anthropic Prompt Engineering Overview",
    url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
  },
  {
    label: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    url: "https://arxiv.org/abs/2201.11903",
  },
  {
    label: "Large Language Models are Zero-Shot Reasoners",
    url: "https://arxiv.org/abs/2205.11916",
  },
];

const ROADMAP = [
  "Beginner",
  "Zero Shot",
  "One Shot",
  "Few Shot",
  "Role Prompting",
  "Structured Output",
  "Chain of Thought",
  "XML",
  "Agents",
  "Advanced Prompting",
];

const LIBRARY = [
  {
    slug: "zero-shot-prompt",
    title: "Zero-Shot Prompting",
    shortTitle: "Zero Shot",
    category: "Foundation",
    difficulty: "Beginner",
    tags: ["baseline", "instruction", "fast-start"],
    model: "Unknown",
    version: "v1.0",
    createdDate: "2026-07-13",
    estimatedTokens: null,
    promptText: "",
    promptOrigin: "No standalone prompt file exists in the `ZeroShortPrompt` folder, so this entry documents the technique and links to the original playground UI.",
    description:
      "Ask the model to do a task directly, without adding worked examples first. This is the fastest way to test whether the model already understands the shape of the job.",
    bestUseCases: ["classification", "rewriting", "short explanations"],
    compatibility: "Works across most modern general-purpose chat models.",
    playgroundPath: "ZeroShortPrompt/index.html",
    playgroundKind: "iframe",
    featured: true,
    preview:
      "Best when the task is common, the format is flexible, and you want the quickest first pass before adding more scaffolding.",
    definition:
      "Zero-shot prompting means giving an instruction without including sample inputs and outputs. Official prompt guides consistently recommend starting here because it reveals whether the model can solve the task with minimal context before you spend tokens on examples or structure.",
    advantages: [
      "Fast to write and easy to iterate.",
      "Low token cost compared with example-heavy prompts.",
      "Useful as a baseline before testing more advanced patterns.",
    ],
    limitations: [
      "Less reliable when the task has a strict output format.",
      "Can drift in style or detail if the instruction is vague.",
      "Needs stronger wording on complex multi-step tasks.",
    ],
    commonMistakes: [
      "Asking for too many outcomes in one instruction.",
      "Leaving constraints implicit instead of stating them directly.",
      "Judging the technique too quickly without tightening the wording.",
    ],
    whenNotToUse: [
      "When you need machine-parseable output every time.",
      "When a single formatting example would eliminate ambiguity.",
    ],
    useCases: [
      "Summarize a meeting in five bullets.",
      "Rewrite copy in a friendlier tone.",
      "Classify customer feedback into known categories.",
    ],
    industryExamples: [
      "Support teams use zero-shot prompts for quick ticket triage.",
      "Content teams use them for headline ideation and short rewrites.",
    ],
    process: [
      "State the task clearly.",
      "Add the minimum useful context.",
      "Name constraints such as tone, length, or format.",
      "Review the output and tighten only the weak parts.",
    ],
    structure: [
      {
        label: "Instruction",
        text: "Tell the model exactly what action to perform, such as summarize, classify, rewrite, or extract.",
      },
      {
        label: "Context",
        text: "Provide only the information needed to complete the task accurately.",
      },
      {
        label: "Constraints",
        text: "Specify length, audience, tone, or exclusions so the model does not guess.",
      },
      {
        label: "Output Format",
        text: "If the shape matters, say it explicitly even when you are not providing examples.",
      },
    ],
    comparison: {
      needsExamples: "No",
      reasoning: "Light",
      bestFor: "Common tasks",
      quality: "Good",
      tokenCost: "Low",
      speed: "Fast",
      reliability: "Medium",
    },
  },
  {
    slug: "one-shot-prompt",
    title: "One-Shot Prompting",
    shortTitle: "One Shot",
    category: "Examples",
    difficulty: "Beginner",
    tags: ["example", "format", "pattern"],
    model: "Kimi 2.6",
    version: "v1.0",
    createdDate: "2026-07-13",
    promptText: `Write an engaging introduction for a blog post about remote work productivity.

Example:
Topic: Benefits of morning exercise
Introduction: "Picture this: It's 6 AM, your alarm goes off, and instead of hitting snooze, you lace up your sneakers. Sound impossible? Here's the thing—those who exercise before breakfast report 23% higher energy levels throughout their workday. But the real secret isn't just the exercise itself; it's what happens to your brain chemistry in those precious morning hours."

Now write an introduction for: Remote work productivity tips`,
    promptOrigin: "Prompt extracted from `OneShortPrompt/OneShortPromptExample.txt`.",
    description:
      "Provide exactly one example so the model can copy the pattern, tone, or structure before handling the real input.",
    bestUseCases: ["tone transfer", "response formatting", "style mimicry"],
    compatibility: "Works best on chat models that follow examples closely.",
    playgroundPath: "OneShortPrompt/index.html",
    playgroundKind: "iframe",
    featured: true,
    preview:
      "Use one strong example when you want to show the target style faster than you could describe it.",
    definition:
      "One-shot prompting gives the model a single demonstration before the real task. Prompting guides often describe this as a show-don't-tell technique because a well-chosen example can anchor the model's output faster than a long wall of instructions.",
    advantages: [
      "Stronger format control than zero-shot prompting.",
      "Good balance between guidance and token efficiency.",
      "Excellent for tone, structure, and style transfer.",
    ],
    limitations: [
      "A bad example can bias the whole answer.",
      "One example may not cover edge cases.",
      "Still weaker than schema-based output when exact fields matter.",
    ],
    commonMistakes: [
      "Using an edge case as the example.",
      "Packing hidden requirements into the example instead of stating them.",
      "Forgetting to keep the example representative of the normal case.",
    ],
    whenNotToUse: [
      "When different valid answers follow multiple patterns.",
      "When you need several contrasting examples to reduce ambiguity.",
    ],
    useCases: [
      "Writing introductions in a house style.",
      "Teaching a model how to answer product FAQs.",
      "Showing the format of a short explanation or rubric.",
    ],
    industryExamples: [
      "Marketing teams use one-shot prompts to mirror a preferred voice.",
      "Education products use them to set the level of explanation for a learner.",
    ],
    process: [
      "Write the task.",
      "Insert one representative example.",
      "Separate the example from the real request.",
      "Ask the model to continue with the same pattern.",
    ],
    structure: [
      {
        label: "Instruction",
        text: "Describe the task you want completed.",
      },
      {
        label: "Example",
        text: "Provide one high-quality sample that demonstrates the desired structure or tone.",
      },
      {
        label: "Transfer Request",
        text: "Point the model to the new input and ask it to follow the same pattern.",
      },
      {
        label: "Constraints",
        text: "Add any audience, length, or wording limits that the example alone does not encode.",
      },
    ],
    comparison: {
      needsExamples: "One",
      reasoning: "Light",
      bestFor: "Format imitation",
      quality: "Good",
      tokenCost: "Low-Medium",
      speed: "Fast",
      reliability: "Medium-High",
    },
  },
  {
    slug: "few-shot-prompt",
    title: "Few-Shot Prompting",
    shortTitle: "Few Shot",
    category: "Examples",
    difficulty: "Intermediate",
    tags: ["examples", "calibration", "consistency"],
    model: "Kimi 2.6",
    version: "v1.0",
    createdDate: "2026-07-14",
    promptText: `Analyze the business decision with the requested level of detail.

Decision: Opening a new store location
Analysis Level: Quick take
Response: New location appears viable given foot traffic data and competitor absence, though initial investment is substantial.

Decision: Switching software providers
Analysis Level: Standard review
Response: Migration offers long-term cost savings of 30% and better feature set. However, switching requires 2-month transition period with potential disruption to operations. Staff training needed but vendor provides support. Recommend phased rollout starting with non-critical systems.

Decision: Launching a new product line
Analysis Level: Comprehensive assessment
Response: Market analysis indicates strong demand with 40% of surveyed customers expressing interest. Competitive landscape shows opportunity for differentiation through our unique manufacturing process. Financial projections suggest break-even within 18 months, with 25% profit margins by year 3. Risk factors include supply chain dependencies on single vendor and need for $2M initial investment. Manufacturing capacity exists but requires equipment upgrades. Marketing strategy should emphasize sustainability angle based on focus group feedback. Recommend soft launch in Q2 with limited geographic rollout, expanding nationally in Q4 based on performance metrics. Success criteria: 10,000 units sold in first quarter, customer satisfaction above 85%, and return rate below 5%.

Decision: Implementing remote work policy
Analysis Level: Standard review
Response:`,
    promptOrigin: "Prompt extracted from `FewShortPrompt/FewShortPromptExample.txt`.",
    description:
      "Supply multiple examples so the model can infer the pattern and generalize more consistently than it can from a single demonstration.",
    bestUseCases: ["classification", "rubrics", "consistent formatting"],
    compatibility: "Performs well on models that learn input-output patterns from examples.",
    playgroundPath: "FewShortPrompt/index.html",
    playgroundKind: "iframe",
    featured: true,
    preview:
      "Use a small set of representative examples when one sample is not enough to show the pattern or decision boundary.",
    definition:
      "Few-shot prompting uses several examples to teach the model the pattern you care about. It is especially useful when the model must infer how detailed, strict, or nuanced the response should be across multiple cases.",
    advantages: [
      "Improves consistency across similar tasks.",
      "Helps the model infer hidden decision rules.",
      "Useful when output quality depends on examples more than prose instructions.",
    ],
    limitations: [
      "Costs more tokens than zero-shot or one-shot prompts.",
      "Examples can accidentally introduce bias or repetition.",
      "Long example blocks can crowd out fresh context.",
    ],
    commonMistakes: [
      "Including examples that contradict each other.",
      "Adding too many edge cases too early.",
      "Forgetting to keep labels, tone, and structure aligned.",
    ],
    whenNotToUse: [
      "When a clear schema plus one example already solves the problem.",
      "When the context window is tight and examples would push out source material.",
    ],
    useCases: [
      "Calibrating review depth across business decisions.",
      "Training a model to extract fields in a stable format.",
      "Teaching an internal support assistant how to categorize requests.",
    ],
    industryExamples: [
      "Operations teams use few-shot prompts for decision memos.",
      "LLM product teams use them to stabilize label quality before fine-tuning.",
    ],
    process: [
      "Collect representative examples.",
      "Order them from simple to slightly more nuanced.",
      "Keep the formatting identical across examples.",
      "Finish with the real input and leave the response slot open.",
    ],
    structure: [
      {
        label: "Instruction",
        text: "Name the task and the quality bar.",
      },
      {
        label: "Examples",
        text: "Provide two or more aligned examples that demonstrate the expected answer shape.",
      },
      {
        label: "Variables",
        text: "Swap the final example content for the real input while preserving the same structure.",
      },
      {
        label: "Output Format",
        text: "Keep labels and field order stable so the model can mirror them.",
      },
    ],
    comparison: {
      needsExamples: "Multiple",
      reasoning: "Medium",
      bestFor: "Pattern learning",
      quality: "High",
      tokenCost: "Medium",
      speed: "Moderate",
      reliability: "High",
    },
  },
  {
    slug: "personas",
    title: "Persona Prompting",
    shortTitle: "Personas",
    category: "Framing",
    difficulty: "Intermediate",
    tags: ["role", "tone", "expertise"],
    model: "Unknown",
    version: "v1.0",
    createdDate: "2026-07-17",
    promptText: `You are a Senior Engineer with experience building startups from zero to MVP.

Our prompt library currently runs entirely in the browser with localStorage. We're considering making it a production-ready tool that teams can use. Create a comprehensive technical specification that includes:

1. System Architecture Document
2. API Design Specification
3. Scaling Projections

Use your experience to make opinionated recommendations. Write as if you're presenting to a junior engineering team.`,
    promptOrigin: "Prompt extracted and condensed from `Personas/PersonaExample.txt`.",
    description:
      "Assign the model a role so it approaches the task from a chosen perspective, vocabulary, and style rather than answering as a generic assistant.",
    bestUseCases: ["expert reviews", "tone control", "domain framing"],
    compatibility: "Widely supported across instruction-following models.",
    playgroundPath: "Personas/index.html",
    playgroundKind: "iframe",
    featured: true,
    preview:
      "Personas work best when you need a point of view, such as a UX reviewer, security engineer, technical writer, or startup architect.",
    definition:
      "Persona prompting sets a role for the model so it retrieves and presents knowledge from a particular lens. Prompting research and vendor guidance both suggest keeping personas useful but not overly theatrical: the role should focus attention, not trap the model in unnecessary detail.",
    advantages: [
      "Improves tone, vocabulary, and review angle.",
      "Helps separate design, engineering, security, or writing perspectives.",
      "Easy to combine with examples or structured output.",
    ],
    limitations: [
      "Does not magically make the model smarter.",
      "Too much persona detail can make the answer rigid.",
      "Role language alone cannot replace missing task constraints.",
    ],
    commonMistakes: [
      "Writing a long fictional biography instead of a useful role.",
      "Assuming persona text guarantees factual accuracy.",
      "Combining incompatible roles in one prompt.",
    ],
    whenNotToUse: [
      "When the task is purely extractive and neutral framing is better.",
      "When the role instructions distract from a small, factual output.",
    ],
    useCases: [
      "Review UI from an accessibility perspective.",
      "Generate a technical spec for a junior engineering audience.",
      "Rewrite content from a product-marketing voice.",
    ],
    industryExamples: [
      "Consulting teams use personas to switch between CFO and operator lenses.",
      "Developer tools use reviewer personas for bug, UX, and security audits.",
    ],
    process: [
      "Choose the role that matches the decision lens.",
      "Add the task and audience.",
      "State constraints such as depth, tone, and output shape.",
      "Check whether the response reflects the intended perspective.",
    ],
    structure: [
      {
        label: "Persona",
        text: "Name the relevant role, such as senior engineer, UX designer, or compliance analyst.",
      },
      {
        label: "Task",
        text: "Explain what the role should do with the provided input.",
      },
      {
        label: "Audience",
        text: "Tell the model who the response is for, such as beginners, executives, or developers.",
      },
      {
        label: "Constraints",
        text: "Control length, rigor, tone, and any required sections.",
      },
    ],
    comparison: {
      needsExamples: "Optional",
      reasoning: "Medium",
      bestFor: "Perspective setting",
      quality: "Good-High",
      tokenCost: "Low",
      speed: "Fast",
      reliability: "Medium-High",
    },
  },
  {
    slug: "structured-output",
    title: "Structured Output Prompting",
    shortTitle: "Structured Output",
    category: "Control",
    difficulty: "Intermediate",
    tags: ["schema", "json", "validation"],
    model: "Gemini",
    version: "v1.0",
    createdDate: "2026-07-16",
    promptText: `Create a metadata tracking system for a prompt journal web application that is attached to our prompts in our prompt library.

FUNCTION SPECIFICATIONS:
1. trackModel(modelName: string, content: string): MetadataObject
2. updateTimestamps(metadata: MetadataObject): MetadataObject
3. estimateTokens(text: string, isCode: boolean): TokenEstimate

VALIDATION RULES:
- All dates must be valid ISO 8601 strings
- Model name must be non-empty string, max 100 characters
- Throw errors for invalid inputs with descriptive messages

OUTPUT SCHEMA:
{
  model: string,
  createdAt: string,
  updatedAt: string,
  tokenEstimate: {
    min: number,
    max: number,
    confidence: 'high' | 'medium' | 'low'
  }
}`,
    promptOrigin: "Prompt extracted from `StructuredOutput/StructuredOutputPrompt.txt`.",
    description:
      "Ask the model to return information in a fixed schema so downstream code can parse, validate, and reuse the answer reliably.",
    bestUseCases: ["JSON extraction", "tool inputs", "typed pipelines"],
    compatibility: "Best on models that handle schema-following and format constraints well.",
    playgroundPath: "StructuredOutput/index.html",
    playgroundKind: "iframe",
    featured: true,
    preview:
      "Use structured output when the answer feeds code, forms, automations, or another model step that cannot tolerate format drift.",
    definition:
      "Structured output prompting asks the model to respond in a predetermined shape such as JSON, labeled fields, or a schema-aligned object. Prompt engineering guides consistently recommend making the output contract explicit whenever another system has to consume the answer.",
    advantages: [
      "Makes responses easier to validate and parse.",
      "Reduces format drift across repeated calls.",
      "Supports tool use, automation, and chained workflows.",
    ],
    limitations: [
      "Can feel rigid on open-ended creative tasks.",
      "Poor schema design creates brittle prompts.",
      "Some models still need retries if the structure is complex.",
    ],
    commonMistakes: [
      "Requesting a schema without describing the allowed values.",
      "Combining narrative text with machine-readable output in the same response.",
      "Forgetting to validate the output after generation.",
    ],
    whenNotToUse: [
      "When the user primarily needs creative exploration instead of strict formatting.",
      "When the schema is still changing rapidly and overhead outweighs the benefit.",
    ],
    useCases: [
      "Extracting fields from support emails.",
      "Generating typed metadata for prompts.",
      "Returning objects for web app workflows and tool calls.",
    ],
    industryExamples: [
      "AI products use structured output for routers, evaluators, and extractors.",
      "Internal automations use it to pass stable data between steps.",
    ],
    process: [
      "Define the required fields.",
      "State validation rules and allowed values.",
      "Show or describe the exact output shape.",
      "Reject extra commentary unless you truly need it.",
    ],
    structure: [
      {
        label: "Instruction",
        text: "Describe the task the model must perform.",
      },
      {
        label: "Constraints",
        text: "List validation rules, type requirements, and failure behavior.",
      },
      {
        label: "Output Format",
        text: "Provide the schema or exact labeled structure that the response must follow.",
      },
      {
        label: "Examples",
        text: "Optional examples help when the schema is complex or nested.",
      },
    ],
    comparison: {
      needsExamples: "Optional",
      reasoning: "Medium",
      bestFor: "Reliable machine use",
      quality: "High",
      tokenCost: "Medium",
      speed: "Moderate",
      reliability: "High",
    },
  },
  {
    slug: "zero-shot-cot",
    title: "Zero-Shot Chain-of-Thought",
    shortTitle: "Zero-Shot CoT",
    category: "Reasoning",
    difficulty: "Advanced",
    tags: ["reasoning", "step-by-step", "analysis"],
    model: "Claude Sonnet 5",
    version: "v1.0",
    createdDate: "2026-07-16",
    promptText: `Let's build a complete export/import system step by step.

Step 1: First, analyze what data we need to export:
- All prompts with their metadata

Step 2: Design the export JSON schema that includes:
- Version number for future compatibility
- Export timestamp
- Statistics
- Complete prompts array

Step 3: Create the export function
Step 4: Create the import function
Step 5: Add error recovery

Add the import and export buttons and merge conflict resolution prompts.

Implement this complete system with all steps. Think step by step.`,
    promptOrigin: "Prompt extracted from `ZeroShortCOTPrompt/PromptForProject.txt` and supported by the chain-of-thought examples in the same folder.",
    description:
      "Prompt the model to reason through intermediate steps before delivering the final answer, but do it without supplying worked reasoning examples first.",
    bestUseCases: ["planning", "debugging", "multi-step analysis"],
    compatibility: "Most useful on stronger reasoning-capable models.",
    playgroundPath: "ZeroShortCOTPrompt/index.html",
    playgroundKind: "iframe",
    featured: true,
    preview:
      "Reach for zero-shot CoT when the task has dependencies, tradeoffs, or multi-step logic that a single direct answer might skip.",
    definition:
      "Zero-shot chain-of-thought adds a reasoning cue such as 'think step by step' without providing examples. Foundational reasoning papers showed that this simple nudge can improve performance on multi-step tasks because it encourages the model to expose and follow intermediate logic.",
    advantages: [
      "Improves decomposition on complex tasks.",
      "Helps surface hidden assumptions and missing steps.",
      "Useful for planning, debugging, and diagnostics.",
    ],
    limitations: [
      "Longer outputs increase token cost.",
      "Reasoning can still be wrong even when it sounds detailed.",
      "Not ideal when you only need a short final answer quickly.",
    ],
    commonMistakes: [
      "Treating visible reasoning as proof of correctness.",
      "Using chain-of-thought on trivial tasks that do not need it.",
      "Forgetting to request the final answer or artifact after the reasoning.",
    ],
    whenNotToUse: [
      "When latency and token budget matter more than decomposition.",
      "When a direct extraction or schema output is enough.",
    ],
    useCases: [
      "Planning an import-export feature with safeguards.",
      "Diagnosing why a plant's leaves are turning yellow.",
      "Breaking down arithmetic or logical reasoning tasks.",
    ],
    industryExamples: [
      "Engineering teams use CoT-style prompts for planning implementation steps.",
      "Support copilots use them to walk through troubleshooting paths.",
    ],
    process: [
      "Ask the model to reason step by step.",
      "Break the task into ordered subproblems.",
      "Work through dependencies before implementation.",
      "End with a concise final answer or artifact.",
    ],
    structure: [
      {
        label: "Instruction",
        text: "State the full task clearly.",
      },
      {
        label: "Reasoning Cue",
        text: "Add a phrase that encourages decomposition, such as think step by step.",
      },
      {
        label: "Sub-steps",
        text: "Optional numbered steps help anchor the reasoning path.",
      },
      {
        label: "Final Output",
        text: "Request the final recommendation, plan, or artifact after the reasoning chain.",
      },
    ],
    comparison: {
      needsExamples: "No",
      reasoning: "High",
      bestFor: "Complex planning",
      quality: "High",
      tokenCost: "Medium-High",
      speed: "Slower",
      reliability: "Medium-High",
    },
  },
  {
    slug: "delimiters-and-xml",
    title: "Delimiters and XML Prompting",
    shortTitle: "Delimiters & XML",
    category: "Control",
    difficulty: "Advanced",
    tags: ["xml", "sections", "separation"],
    model: "Claude Sonnet 5",
    version: "v1.0",
    createdDate: "2026-07-16",
    promptText: `<research_area>
<topic>Prompt Management Solutions</topic>
<questions>
- What tools currently exist for prompt library management?
</questions>
</research_area>

<research_area>
<topic>Collaboration Features</topic>
<questions>
- How do teams share Postman collections or Insomnia workspaces?
- What permission models exist in developer tools?
</questions>
</research_area>`,
    promptOrigin: "Prompt extracted from `DelimitersAndXML/prompt-library-market-research.md`.",
    description:
      "Wrap different prompt sections in explicit boundaries so the model can separate instructions, source material, examples, and output requirements more reliably.",
    bestUseCases: ["complex prompts", "multi-part tasks", "injection resistance"],
    compatibility: "Especially effective on models that respond well to structured markup.",
    playgroundPath: "DelimitersAndXML/prompt-library-market-research.md",
    playgroundKind: "doc",
    featured: false,
    preview:
      "Delimiters help when the prompt has multiple sections that the model should not blur together, such as context, constraints, and examples.",
    definition:
      "Delimiter-based prompting uses visible boundaries such as XML tags, markdown headings, or triple-quoted blocks to separate semantic regions. Official prompt guidance recommends this because structured sections reduce ambiguity and make it easier for the model to distinguish instructions from data.",
    advantages: [
      "Clarifies the shape of a long prompt.",
      "Improves readability for both humans and models.",
      "Makes nested context, examples, and constraints easier to manage.",
    ],
    limitations: [
      "Over-structuring small prompts adds unnecessary noise.",
      "Bad tag names can make the prompt harder to read.",
      "It is not a complete defense against all prompt injection issues.",
    ],
    commonMistakes: [
      "Using generic tag names that hide meaning.",
      "Forgetting to close or mirror structural sections consistently.",
      "Mixing source content and instructions in the same unlabelled block.",
    ],
    whenNotToUse: [
      "When the prompt is tiny and already unambiguous.",
      "When the structure becomes more complex than the task itself.",
    ],
    useCases: [
      "Segmenting research tasks into topic-specific blocks.",
      "Separating source text from extraction instructions.",
      "Making long evaluation prompts easier to audit.",
    ],
    industryExamples: [
      "LLM pipelines use XML tags to wrap tool inputs, user data, and policies.",
      "Enterprise prompts use clear delimiters to reduce accidental instruction bleed.",
    ],
    process: [
      "Split the prompt into meaningful sections.",
      "Give each section a semantic label.",
      "Nest subsections only when it improves clarity.",
      "Keep the output instructions in their own final block.",
    ],
    structure: [
      {
        label: "Instruction",
        text: "Put the task definition in a dedicated section.",
      },
      {
        label: "Context",
        text: "Wrap documents, notes, or source text in separate labelled containers.",
      },
      {
        label: "Constraints",
        text: "Keep guardrails and evaluation rules in their own block so they are easy to spot.",
      },
      {
        label: "Variables",
        text: "Use tags for topic names, questions, schemas, or any dynamic fields.",
      },
    ],
    comparison: {
      needsExamples: "Optional",
      reasoning: "Medium",
      bestFor: "Complex prompts",
      quality: "High",
      tokenCost: "Medium",
      speed: "Moderate",
      reliability: "High",
    },
  },
  {
    slug: "emotional-prompting",
    title: "Emotional Prompting",
    shortTitle: "Emotional Prompting",
    category: "Framing",
    difficulty: "Advanced",
    tags: ["attention", "stakes", "framing"],
    model: "Unknown",
    version: "v1.0",
    createdDate: "2026-07-16",
    promptText: "",
    promptOrigin: "The folder contains a screenshot artifact rather than a raw prompt text file.",
    description:
      "Add emotionally weighted framing to emphasize that the task matters, with the goal of making the model focus more carefully on the important parts of the instruction.",
    bestUseCases: ["careful reviews", "evaluation framing", "high-stakes emphasis"],
    compatibility: "Varies by model and should be tested rather than assumed.",
    playgroundPath:
      "EmotionalPrompt/Screenshot 2026-07-16 at 22-42-53 Emotional Prompts - Practical Prompt Engineering Master.dev.png",
    playgroundKind: "image",
    featured: false,
    preview:
      "This technique tries to increase attentional focus by framing the task as important or consequential.",
    definition:
      "Emotional prompting adds phrases that raise perceived importance, such as saying the task matters to a career or outcome. Research notes in this repository focus on the idea that emotional wording may redirect attention toward the important tokens in the actual task, rather than simply making the response more dramatic.",
    advantages: [
      "Useful as an experimental framing tool.",
      "Can encourage more careful wording on review-oriented tasks.",
      "Simple to combine with stronger primary techniques.",
    ],
    limitations: [
      "Effects are inconsistent and model-dependent.",
      "Should not be treated as a substitute for clear instructions.",
      "Can sound theatrical if overused.",
    ],
    commonMistakes: [
      "Using emotional language without clarifying the real task.",
      "Assuming higher emotional intensity equals higher correctness.",
      "Ignoring evaluation and relying on anecdotal wins.",
    ],
    whenNotToUse: [
      "When neutral, concise instructions already work well.",
      "When the application needs stable, style-neutral outputs.",
    ],
    useCases: [
      "Experimenting with evaluation prompts.",
      "Prompt research and A/B testing.",
      "Asking for especially careful review on sensitive outputs.",
    ],
    industryExamples: [
      "Prompt researchers test emotional framing as a modifier, not a primary technique.",
      "Teams sometimes pair it with evaluation prompts to increase caution signals.",
    ],
    process: [
      "Write the core task first.",
      "Add a light importance signal if you want to test framing effects.",
      "Measure whether the output actually improves.",
      "Keep or remove the framing based on evidence, not intuition.",
    ],
    structure: [
      {
        label: "Instruction",
        text: "The task itself still needs to be explicit and specific.",
      },
      {
        label: "Importance Signal",
        text: "A short sentence can indicate why the task deserves careful attention.",
      },
      {
        label: "Constraints",
        text: "Specify what correct, cautious, or complete output means.",
      },
      {
        label: "Output Format",
        text: "Keep the expected result shape clear so the framing does not become the main focus.",
      },
    ],
    comparison: {
      needsExamples: "No",
      reasoning: "Light-Medium",
      bestFor: "Experimental framing",
      quality: "Variable",
      tokenCost: "Low",
      speed: "Fast",
      reliability: "Low-Medium",
    },
  },
  {
    slug: "standard-prompt",
    title: "Standard Prompting",
    shortTitle: "Standard Prompt",
    category: "Foundation",
    difficulty: "Beginner",
    tags: ["direct", "question", "baseline"],
    model: "Unknown",
    version: "v1.0",
    createdDate: "2026-07-13",
    promptText: "",
    promptOrigin: "No source prompt file exists in `StandardPrompt`; the folder currently contains the original standalone HTML reference.",
    description:
      "Ask a straightforward question or instruction without extra technique scaffolding. This is the minimal baseline every other prompt pattern builds on.",
    bestUseCases: ["quick questions", "simple drafting", "initial exploration"],
    compatibility: "Universal across modern conversational models.",
    playgroundPath: "StandardPrompt/StandardPrompt.html",
    playgroundKind: "iframe",
    featured: false,
    preview:
      "Standard prompts are the cleanest way to ask direct questions before you decide whether you need examples, personas, or structure.",
    definition:
      "A standard prompt is the plain-language version of a task request. It is broader than zero-shot prompting because it can include direct questions or instructions even when you are not carefully designing the surrounding control structure.",
    advantages: [
      "Fastest possible way to start.",
      "Great for exploration and first-pass brainstorming.",
      "Easy to convert into more advanced techniques later.",
    ],
    limitations: [
      "Weak control over style and output shape.",
      "Easy for the model to add things you did not ask for.",
      "Can feel vague on implementation-heavy tasks.",
    ],
    commonMistakes: [
      "Assuming the model knows the intended audience and depth.",
      "Not clarifying what to exclude.",
      "Using one huge standard prompt instead of breaking a big task apart.",
    ],
    whenNotToUse: [
      "When you need strict format guarantees.",
      "When the task has multiple hidden requirements.",
    ],
    useCases: [
      "Quick content drafts.",
      "Direct questions about a topic.",
      "Rapid prototyping before prompt refinement.",
    ],
    industryExamples: [
      "Writers use standard prompts for ideation.",
      "Developers use them to get a quick first approach before tightening requirements.",
    ],
    process: [
      "Ask directly.",
      "Review the output for missing assumptions.",
      "Refine with constraints or examples if needed.",
    ],
    structure: [
      {
        label: "Instruction",
        text: "State the question or task plainly.",
      },
      {
        label: "Context",
        text: "Add only what the model truly needs to answer well.",
      },
      {
        label: "Constraints",
        text: "If the first answer is too broad, add the missing limits.",
      },
      {
        label: "Output Format",
        text: "Optional unless a specific shape matters.",
      },
    ],
    comparison: {
      needsExamples: "No",
      reasoning: "Low",
      bestFor: "Fast starts",
      quality: "Variable",
      tokenCost: "Low",
      speed: "Fastest",
      reliability: "Medium",
    },
  },
];

const state = {
  search: "",
  difficulty: "",
  model: "",
  category: "",
  technique: "",
  openTechnique: null,
  expandedCode: false,
};

const elements = {
  body: document.body,
  header: document.querySelector(".site-header"),
  navLinks: Array.from(document.querySelectorAll(".nav-menu a")),
  navMenu: document.getElementById("navMenu"),
  navToggle: document.getElementById("navToggle"),
  themeToggle: document.getElementById("themeToggle"),
  themeToggleValue: document.getElementById("themeToggleValue"),
  heroStats: document.getElementById("heroStats"),
  heroMiniGrid: document.getElementById("heroMiniGrid"),
  searchInput: document.getElementById("searchInput"),
  difficultyFilter: document.getElementById("difficultyFilter"),
  modelFilter: document.getElementById("modelFilter"),
  categoryFilter: document.getElementById("categoryFilter"),
  techniqueFilter: document.getElementById("techniqueFilter"),
  categoryStrip: document.getElementById("categoryStrip"),
  featuredGrid: document.getElementById("featuredGrid"),
  roadmapList: document.getElementById("roadmapList"),
  cardsGrid: document.getElementById("cardsGrid"),
  resultsSummary: document.getElementById("resultsSummary"),
  comparisonBody: document.getElementById("comparisonBody"),
  sourceList: document.getElementById("sourceList"),
  detailPanel: document.getElementById("detailPanel"),
  detailBackdrop: document.getElementById("detailBackdrop"),
  detailClose: document.getElementById("detailClose"),
  detailBody: document.getElementById("detailBody"),
  detailCategory: document.getElementById("detailCategory"),
  detailTitle: document.getElementById("detailTitle"),
  detailSummary: document.getElementById("detailSummary"),
  detailMeta: document.getElementById("detailMeta"),
  detailDefinition: document.getElementById("detailDefinition"),
  detailAdvantages: document.getElementById("detailAdvantages"),
  detailLimitations: document.getElementById("detailLimitations"),
  detailMistakes: document.getElementById("detailMistakes"),
  detailWhenNot: document.getElementById("detailWhenNot"),
  detailUseCases: document.getElementById("detailUseCases"),
  detailExamples: document.getElementById("detailExamples"),
  detailProcess: document.getElementById("detailProcess"),
  detailDiagram: document.getElementById("detailDiagram"),
  detailAnatomy: document.getElementById("detailAnatomy"),
  detailPromptNote: document.getElementById("detailPromptNote"),
  detailCodeMeta: document.getElementById("detailCodeMeta"),
  codeViewer: document.getElementById("codeViewer"),
  codeLines: document.getElementById("codeLines"),
  copyPromptButton: document.getElementById("copyPromptButton"),
  expandPromptButton: document.getElementById("expandPromptButton"),
  detailModel: document.getElementById("detailModel"),
  detailVersion: document.getElementById("detailVersion"),
  detailDate: document.getElementById("detailDate"),
  openPlaygroundLink: document.getElementById("openPlaygroundLink"),
  playgroundStage: document.getElementById("playgroundStage"),
  detailRelated: document.getElementById("detailRelated"),
  emptyStateTemplate: document.getElementById("emptyStateTemplate"),
};

function init() {
  initTheme();
  renderStaticSections();
  populateFilterOptions();
  bindEvents();
  renderLibrary();
  initObservers();
}

function initTheme() {
  const savedTheme = localStorage.getItem("ppe-theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (systemDark ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
  updateThemeLabel(savedTheme ? savedTheme : "auto");
}

function updateThemeLabel(label) {
  elements.themeToggleValue.textContent =
    label === "dark" ? "Dark" : label === "light" ? "Light" : "Auto";
}

function renderStaticSections() {
  const playgroundCount = LIBRARY.filter((item) => item.playgroundKind === "iframe").length;
  const promptCount = LIBRARY.filter((item) => item.promptText).length;

  elements.heroStats.innerHTML = [
    statItem(String(LIBRARY.length), "Techniques indexed"),
    statItem(String(playgroundCount), "Existing playgrounds connected"),
    statItem(String(promptCount), "Source prompt artifacts displayed"),
  ].join("");

  elements.heroMiniGrid.innerHTML = [
    miniCard("Search and filter", "Find techniques by model, tags, category, and difficulty."),
    miniCard("Learn the why", "Read advantages, limits, mistakes, and anatomy for each prompt."),
    miniCard("Inspect the prompt", "Open the original prompt text with copy, expand, and token info."),
    miniCard("Launch the playground", "Reuse the existing project pages instead of rebuilding them."),
  ].join("");

  elements.categoryStrip.innerHTML = buildCategoryCards().join("");
  elements.featuredGrid.innerHTML = LIBRARY.filter((item) => item.featured)
    .slice(0, 4)
    .map(renderFeaturedCard)
    .join("");

  elements.roadmapList.innerHTML = ROADMAP.map((item, index) => {
    return `<li class="reveal"><span class="roadmap-index">${index + 1}</span><div><strong>${escapeHtml(
      item
    )}</strong><p>${roadmapDescription(item)}</p></div></li>`;
  }).join("");

  elements.comparisonBody.innerHTML = LIBRARY.map((item) => {
    return `<tr>
      <td><strong>${escapeHtml(item.shortTitle)}</strong></td>
      <td>${escapeHtml(item.comparison.needsExamples)}</td>
      <td>${escapeHtml(item.comparison.reasoning)}</td>
      <td>${escapeHtml(item.comparison.bestFor)}</td>
      <td>${escapeHtml(item.comparison.quality)}</td>
      <td>${escapeHtml(item.difficulty)}</td>
      <td>${escapeHtml(item.comparison.tokenCost)}</td>
      <td>${escapeHtml(item.comparison.speed)}</td>
      <td>${escapeHtml(item.comparison.reliability)}</td>
    </tr>`;
  }).join("");

  elements.sourceList.innerHTML = SOURCES.map(
    (source) =>
      `<li><a href="${source.url}" target="_blank" rel="noopener">${escapeHtml(source.label)}</a></li>`
  ).join("");
}

function populateFilterOptions() {
  fillSelect(elements.difficultyFilter, uniqueValues(LIBRARY.map((item) => item.difficulty)));
  fillSelect(elements.modelFilter, uniqueValues(LIBRARY.map((item) => item.model)));
  fillSelect(elements.categoryFilter, uniqueValues(LIBRARY.map((item) => item.category)));
  fillSelect(elements.techniqueFilter, LIBRARY.map((item) => item.title));
}

function fillSelect(select, options) {
  options.forEach((option) => {
    const node = document.createElement("option");
    node.value = option;
    node.textContent = option;
    select.appendChild(node);
  });
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderLibrary();
  });

  elements.difficultyFilter.addEventListener("change", (event) => {
    state.difficulty = event.target.value;
    renderLibrary();
  });

  elements.modelFilter.addEventListener("change", (event) => {
    state.model = event.target.value;
    renderLibrary();
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderLibrary();
  });

  elements.techniqueFilter.addEventListener("change", (event) => {
    state.technique = event.target.value;
    renderLibrary();
  });

  elements.cardsGrid.addEventListener("click", handleCardActions);
  elements.featuredGrid.addEventListener("click", handleCardActions);
  elements.detailRelated.addEventListener("click", handleCardActions);

  elements.navToggle.addEventListener("click", () => {
    const isOpen = elements.navMenu.classList.toggle("is-open");
    elements.navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  elements.navMenu.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      elements.navMenu.classList.remove("is-open");
      elements.navToggle.setAttribute("aria-expanded", "false");
    }
  });

  elements.themeToggle.addEventListener("click", cycleTheme);
  elements.detailBackdrop.addEventListener("click", closeDetail);
  elements.detailClose.addEventListener("click", closeDetail);
  elements.copyPromptButton.addEventListener("click", copyOpenPrompt);
  elements.expandPromptButton.addEventListener("click", toggleCodeExpand);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.openTechnique) {
      closeDetail();
    }
  });

  window.addEventListener("scroll", () => {
    elements.header.classList.toggle("is-scrolled", window.scrollY > 10);
  });
}

function renderLibrary() {
  const filtered = getFilteredLibrary();
  elements.resultsSummary.textContent = `${filtered.length} of ${LIBRARY.length} techniques shown`;

  if (!filtered.length) {
    elements.cardsGrid.innerHTML = "";
    elements.cardsGrid.appendChild(elements.emptyStateTemplate.content.cloneNode(true));
    return;
  }

  elements.cardsGrid.innerHTML = filtered.map(renderTechniqueCard).join("");
}

function getFilteredLibrary() {
  return LIBRARY.filter((item) => {
    const haystack = [
      item.title,
      item.description,
      item.category,
      item.model,
      item.tags.join(" "),
      item.bestUseCases.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesDifficulty = !state.difficulty || item.difficulty === state.difficulty;
    const matchesModel = !state.model || item.model === state.model;
    const matchesCategory = !state.category || item.category === state.category;
    const matchesTechnique = !state.technique || item.title === state.technique;

    return (
      matchesSearch &&
      matchesDifficulty &&
      matchesModel &&
      matchesCategory &&
      matchesTechnique
    );
  });
}

function renderTechniqueCard(item) {
  const promptStats = item.promptText ? getPromptStats(item.promptText) : null;
  const tokens = promptStats ? `${promptStats.tokenEstimate} tokens` : "No prompt file";
  const promptPreview = item.promptText
    ? truncate(item.promptText.replace(/\s+/g, " "), 180)
    : "No raw prompt file was found in this folder, so this card documents the technique and links to the original asset.";

  return `<article class="technique-card reveal" data-preview="true">
    <div class="card-topline">
      <span class="pill is-featured">${escapeHtml(item.category)}</span>
      <span class="pill difficulty-${slugify(item.difficulty)}">${escapeHtml(item.difficulty)}</span>
    </div>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.description)}</p>
    <div class="meta-grid">
      <div><strong>Best Use Cases</strong>${escapeHtml(item.bestUseCases.join(", "))}</div>
      <div><strong>Model Compatibility</strong>${escapeHtml(item.compatibility)}</div>
      <div><strong>Prompt Category</strong>${escapeHtml(item.category)}</div>
      <div><strong>Model</strong>${escapeHtml(item.model)}</div>
      <div><strong>Estimated Tokens</strong>${escapeHtml(tokens)}</div>
      <div><strong>Prompt Version</strong>${escapeHtml(item.version)}</div>
      <div><strong>Created Date</strong>${escapeHtml(formatDate(item.createdDate))}</div>
      <div><strong>Technique</strong>${escapeHtml(item.shortTitle)}</div>
    </div>
    <div class="tag-list">${item.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>
    <div class="card-actions">
      <a class="button button-secondary" href="${item.playgroundPath}" target="_blank" rel="noopener">Open Playground</a>
      <button class="button button-primary" type="button" data-technique="${item.slug}" data-action="learn">Learn More</button>
    </div>
    <div class="preview-card" aria-hidden="true">
      <p>${escapeHtml(promptPreview)}</p>
      <div class="preview-meta">
        <span>${escapeHtml(tokens)}</span>
        <span>${escapeHtml(item.model)}</span>
        <span>${escapeHtml(item.bestUseCases.join(", "))}</span>
      </div>
    </div>
  </article>`;
}

function renderFeaturedCard(item) {
  return `<article class="featured-card reveal">
    <span class="pill">${escapeHtml(item.category)}</span>
    <h3>${escapeHtml(item.title)}</h3>
    <p>${escapeHtml(item.preview)}</p>
    <div class="card-actions">
      <button class="button button-primary" type="button" data-technique="${item.slug}" data-action="learn">Learn More</button>
    </div>
  </article>`;
}

function handleCardActions(event) {
  const trigger = event.target.closest("[data-technique]");
  if (!trigger) return;
  const slug = trigger.getAttribute("data-technique");
  openDetail(slug);
}

function openDetail(slug) {
  const item = LIBRARY.find((entry) => entry.slug === slug);
  if (!item) return;

  state.openTechnique = item.slug;
  state.expandedCode = false;

  elements.detailCategory.textContent = item.category;
  elements.detailTitle.textContent = item.title;
  elements.detailSummary.textContent = item.description;
  elements.detailMeta.innerHTML = [
    metaChip(item.difficulty),
    metaChip(item.model),
    metaChip(item.version),
    metaChip(formatDate(item.createdDate)),
  ].join("");
  elements.detailDefinition.textContent = item.definition;

  renderList(elements.detailAdvantages, item.advantages);
  renderList(elements.detailLimitations, item.limitations);
  renderList(elements.detailMistakes, item.commonMistakes);
  renderList(elements.detailWhenNot, item.whenNotToUse);
  renderList(elements.detailUseCases, item.useCases);
  renderList(elements.detailExamples, item.industryExamples);
  renderOrderedList(elements.detailProcess, item.process);
  renderDiagram(item.process);
  renderAnatomy(item.structure);
  renderPrompt(item);
  renderPlayground(item);
  renderRelated(item);

  elements.detailModel.textContent = item.model;
  elements.detailVersion.textContent = item.version;
  elements.detailDate.textContent = formatDate(item.createdDate);

  elements.detailPanel.classList.add("is-open");
  elements.detailPanel.setAttribute("aria-hidden", "false");
  elements.body.style.overflow = "hidden";
  elements.detailBody.scrollTo({ top: 0, behavior: "smooth" });
  requestAnimationFrame(() => elements.detailClose.focus());
}

function closeDetail() {
  state.openTechnique = null;
  elements.detailPanel.classList.remove("is-open");
  elements.detailPanel.setAttribute("aria-hidden", "true");
  elements.body.style.overflow = "";
}

function renderPrompt(item) {
  elements.detailPromptNote.textContent = item.promptOrigin;
  const promptStats = item.promptText ? getPromptStats(item.promptText) : null;
  elements.detailCodeMeta.innerHTML = promptStats
    ? [
        metaChip(`${promptStats.words} words`),
        metaChip(`${promptStats.tokenEstimate} token estimate`),
        metaChip(`${promptStats.lines} lines`),
      ].join("")
    : metaChip("Prompt unavailable");

  elements.copyPromptButton.disabled = !item.promptText;
  elements.expandPromptButton.disabled = !item.promptText;
  elements.expandPromptButton.textContent = "Expand";
  elements.codeViewer.classList.add("collapsed");

  if (!item.promptText) {
    elements.codeLines.innerHTML = `<div class="code-line"><span class="code-token-strong">No raw prompt file was available in this folder.</span></div>`;
    return;
  }

  const highlighted = highlightPrompt(item.promptText);
  elements.codeLines.innerHTML = highlighted
    .split("\n")
    .map((line) => `<div class="code-line">${line || "&nbsp;"}</div>`)
    .join("");
}

function renderPlayground(item) {
  elements.openPlaygroundLink.href = item.playgroundPath;
  elements.openPlaygroundLink.textContent =
    item.playgroundKind === "iframe" ? "Open Playground" : "Open Source Asset";

  if (item.playgroundKind === "iframe") {
    elements.playgroundStage.innerHTML = `<iframe src="${item.playgroundPath}" title="${escapeHtml(
      item.title
    )} playground" loading="lazy"></iframe>`;
    return;
  }

  if (item.playgroundKind === "image") {
    elements.playgroundStage.innerHTML = `<img src="${item.playgroundPath}" alt="${escapeHtml(
      item.title
    )} source artifact" loading="lazy" />`;
    return;
  }

  elements.playgroundStage.innerHTML = `<div class="playground-note">
    <p>This technique is currently represented by a documentation artifact in the repository rather than a dedicated interactive playground.</p>
    <p>Use the “Open Source Asset” button to inspect the original file directly.</p>
  </div>`;
}

function renderRelated(item) {
  const related = LIBRARY.filter((entry) => {
    if (entry.slug === item.slug) return false;
    return entry.category === item.category || entry.tags.some((tag) => item.tags.includes(tag));
  }).slice(0, 3);

  elements.detailRelated.innerHTML = related
    .map(
      (entry) => `<article class="related-card">
        <h4>${escapeHtml(entry.title)}</h4>
        <p>${escapeHtml(entry.preview)}</p>
        <div class="card-actions">
          <button class="button button-secondary" type="button" data-technique="${entry.slug}" data-action="learn">Open</button>
        </div>
      </article>`
    )
    .join("");
}

function renderDiagram(steps) {
  const nodes = steps.slice(0, 3).map((step) => `<div class="diagram-node">${escapeHtml(step)}</div>`);
  const arrows = nodes.map((node, index) => {
    if (index === nodes.length - 1) return node;
    return `${node}<div class="diagram-arrow">→</div>`;
  });
  elements.detailDiagram.innerHTML = `<div class="diagram-row">${arrows.join("")}</div>`;
}

function renderAnatomy(structure) {
  elements.detailAnatomy.innerHTML = structure
    .map(
      (entry) => `<article class="anatomy-card">
        <h4>${escapeHtml(entry.label)}</h4>
        <p>${escapeHtml(entry.text)}</p>
      </article>`
    )
    .join("");
}

function renderList(container, items) {
  container.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderOrderedList(container, items) {
  container.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function toggleCodeExpand() {
  if (!state.openTechnique) return;
  state.expandedCode = !state.expandedCode;
  elements.codeViewer.classList.toggle("collapsed", !state.expandedCode);
  elements.expandPromptButton.textContent = state.expandedCode ? "Collapse" : "Expand";
}

async function copyOpenPrompt() {
  const item = LIBRARY.find((entry) => entry.slug === state.openTechnique);
  if (!item || !item.promptText) return;
  try {
    await navigator.clipboard.writeText(item.promptText);
    elements.copyPromptButton.textContent = "Copied";
    setTimeout(() => {
      elements.copyPromptButton.textContent = "Copy Prompt";
    }, 1200);
  } catch (error) {
    elements.copyPromptButton.textContent = "Copy failed";
    setTimeout(() => {
      elements.copyPromptButton.textContent = "Copy Prompt";
    }, 1200);
  }
}

function cycleTheme() {
  const current = document.documentElement.dataset.theme;
  const saved = localStorage.getItem("ppe-theme");
  let next;
  if (!saved) {
    next = current === "dark" ? "light" : "dark";
  } else if (saved === "light") {
    next = "dark";
  } else if (saved === "dark") {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = systemDark ? "dark" : "light";
    localStorage.removeItem("ppe-theme");
    updateThemeLabel("auto");
    return;
  } else {
    next = "light";
  }

  document.documentElement.dataset.theme = next;
  localStorage.setItem("ppe-theme", next);
  updateThemeLabel(next);
}

function initObservers() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        elements.navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  document.querySelectorAll(".observed-section").forEach((node) => sectionObserver.observe(node));
}

function buildCategoryCards() {
  const groups = LIBRARY.reduce((accumulator, item) => {
    accumulator[item.category] = accumulator[item.category] || [];
    accumulator[item.category].push(item);
    return accumulator;
  }, {});

  return Object.entries(groups).map(([category, entries]) => {
    return `<article class="category-card reveal">
      <h3>${escapeHtml(category)}</h3>
      <p>${escapeHtml(categoryDescription(category))}</p>
      <div class="badge-row">${entries.map((entry) => `<span class="tag">${escapeHtml(entry.shortTitle)}</span>`).join("")}</div>
    </article>`;
  });
}

function categoryDescription(category) {
  const descriptions = {
    Foundation: "Direct prompting patterns that teach the core interaction model.",
    Examples: "Techniques that use demonstrations to steer outputs more precisely.",
    Framing: "Methods that change perspective, tone, or perceived stakes.",
    Control: "Patterns for stronger structural control and reliability.",
    Reasoning: "Prompting strategies that help the model decompose complex tasks.",
  };
  return descriptions[category] || "Prompting patterns grouped by shared behavior.";
}

function roadmapDescription(item) {
  const descriptions = {
    Beginner: "Learn what prompting is, how context works, and how model outputs vary.",
    "Zero Shot": "Start with direct instructions before adding examples.",
    "One Shot": "Use a single example to lock tone and structure faster.",
    "Few Shot": "Calibrate consistency with multiple demonstrations.",
    "Role Prompting": "Adopt a perspective when expertise or style matters.",
    "Structured Output": "Move from free-form text to explicit schemas and contracts.",
    "Chain of Thought": "Decompose harder tasks into visible intermediate steps.",
    XML: "Use delimiters and tags to separate instructions, context, and variables.",
    Agents: "Combine prompts, tools, memory, and stateful workflows.",
    "Advanced Prompting": "Evaluate, compare, and adapt techniques by model and task.",
  };
  return descriptions[item] || "";
}

function getPromptStats(promptText) {
  const normalized = promptText.trim();
  const words = normalized.split(/\s+/).filter(Boolean).length;
  const lines = normalized.split("\n").length;
  const tokenEstimate = Math.max(1, Math.round(words / 0.75));
  return { words, lines, tokenEstimate };
}

function highlightPrompt(text) {
  return escapeHtml(text)
    .replace(/(&lt;\/?[\w-]+&gt;)/g, '<span class="code-token-tag">$1</span>')
    .replace(/(^|\s)(Step \d+:|FUNCTION SPECIFICATIONS:|VALIDATION RULES:|OUTPUT SCHEMA:|EXAMPLE:)/gm, '$1<span class="code-token-strong">$2</span>')
    .replace(/(\[[^\]]+\]|\{[^}]+\}|Decision:|Response:|Topic:|Introduction:)/g, '<span class="code-token-variable">$1</span>');
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function truncate(text, limit) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}

function slugify(value) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function metaChip(value) {
  return `<span class="meta-chip">${escapeHtml(value)}</span>`;
}

function statItem(number, label) {
  return `<li><strong>${escapeHtml(number)}</strong><span>${escapeHtml(label)}</span></li>`;
}

function miniCard(title, body) {
  return `<article><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

init();
