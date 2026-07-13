1. What is prompt engineering according to OpenAI's definition?
1. Prompt engineering is the process of writing effective instructions for a model such that it consistently generates content that meets your requirements. Because the content generated from a model is nondeterministic, prompting to get your desired output is a mix of art and science. However, you can apply techniques and best practices to get good results consistently.

2. How do Large Language Models (LLMs) generate their outputs?
2. LLMs are pattern predictors that generate one token at a time. They predict the next most likely token based on the input provided. The generation happens token by token with no planning ahead, meaning LLMs only 'think' while they are typing. They will most often predict the next most likely token, but sometimes may predict other likely tokens instead.

3. What is the difference between deterministic and nondeterministic systems, and which category do LLMs fall into?
3. Deterministic systems, like calculators, always produce the same output for a given input (e.g., 2 + 2 always equals 4). Nondeterministic systems can produce different outputs for the same input. LLMs are nondeterministic, meaning if you enter the same prompt multiple times, you will likely get different answers each time. This is because they predict tokens based on probability, not fixed rules.

4. What limitation do LLMs have regarding their training data, and how does this affect their reliability?
4. LLMs are trained on data collected up to a certain cutoff date. While many LLMs now have multi-modality features like internet searching that allow them to find information after their cutoff date, information before the cutoff date tends to be more reliable. This is because post-cutoff information may only exist in limited sources, making the LLM's responses potentially less accurate for very recent events or new technologies.

5. What breakthrough did the 'Attention Is All You Need' research paper introduce, and how did it improve language models?
5. The 2017 'Attention Is All You Need' research paper introduced the transformer architecture with an attention mechanism. This allowed models to pay attention to thousands of words at a time instead of just 5-10 words like phone autocomplete. The architecture also enabled models to learn which tokens mattered most for predictions. Additionally, the paper revealed scaling laws showing that when model size increased by 10X, capability increased by 100X, leading to models that can now handle over a million tokens.

6. What happens when the temperature parameter is set to 0 in a Large Language Model?
6. When temperature is set to 0, the LLM becomes essentially deterministic and will always pick the next most likely token. It provides the most predictable and consistent output.

7. For what types of tasks should you use a lower temperature setting in an LLM, and why?
7. Lower temperature settings are better for factual tasks, code generation, and data extraction. This is particularly important for applications in healthcare or banking where you want the LLM to behave very specifically and avoid making assumptions or guessing low-percentage tokens.

8. What is Top P and how does it differ from temperature in controlling LLM randomness?
8. Top P is a cumulative probability cutoff that limits which tokens the LLM can consider based on their likelihood. Unlike temperature which controls how often the most likely token is picked, Top P restricts the pool of available tokens. For example, setting Top P to 0.5 means only tokens within the top 50% most likely options are considered.

9. If an LLM has token options of blue (75% likelihood), gray (20% likelihood), and orange (5% likelihood), what tokens would be available if Top P is set to 0.5?
9. Only blue would be available. Setting Top P to 0.5 means only tokens within the top 50% cumulative probability are considered. Since blue represents 75% of the probability, it's the only token within the 50% threshold, cutting out both gray and orange as options.

10. What happens when the temperature parameter is set to its maximum value of 2 in an LLM?
10. At temperature 2, the output becomes completely illegible and chaotic. It won't even be broken English—it will just be randomness. This setting is never practically used because the output is unusable.

11. What is the approximate relationship between tokens and words in Large Language Models?
11. Tokens are roughly 0.75 words, but not always. This ratio doesn't hold true for code or punctuation. Tokens are to LLMs what words are to humans - they are how LLMs understand and process language. Words are broken down into token IDs that the LLM ingests to understand input.

12. How do Large Language Models maintain conversation history if they technically have no memory?
12. LLMs maintain conversation history through their context window by sending cumulative tokens (input and output history) with every chat message. For example, when asking a follow-up question, all previous messages and responses are sent along with the new message in the background, even though users don't see this happening.

13. What happens when an LLM reaches its context window token limit during a conversation?
13. When the token limit is reached, the oldest context drops off silently without notification. This means the earliest parts of the conversation will be forgotten first, which can cause the model to lose important initial instructions or context that was provided at the beginning of the conversation.

14. What is a system message in an LLM interaction and how does it affect model behavior?
14. A system message is an invisible instruction set by the provider (OpenAI, Anthropic, GitHub, Cursor, etc.) that controls the LLM's personality and behavior. It takes up part of the context window, remains persistent throughout the conversation, and never drops off. The system message is why the same model behaves differently across different tools - for example, Claude might be a "friendly generalized assistant" in chat but a "helpful coding assistant" in Copilot.

15. Why should you avoid adding entire codebases or large folders to an LLM's context when seeking coding assistance?
15. Adding entire codebases or large folders fills up the context window with unnecessary information, similar to trying to look at every file in a codebase at once, which is overwhelming. This can lead to poor results because the model has too much context to process. Instead, you should add only the minimal amount of context needed, such as specific relevant files like a test file and related frontend file, to get good outputs.

16. What is a standard prompt in the context of working with AI language models?
16. A standard prompt is a direct question or instruction to an AI. It is the simplest form of prompting where you ask the AI what you want to know. It serves as the foundation that all other prompting techniques build upon.

17. How does the quality of a question relate to the quality of an AI's answer?
17. The quality of the question directly relates to the quality of the answer. Similar to asking humans for help, providing context and specific details will result in much better responses than vague or unclear questions.

18. How should questions be formatted when using AI language models, and how does this differ from search engines like Google?
18. When using AI language models, you should ask full questions in complete sentences, similar to how you would ask a neighbor. This differs from search engines like Google where people typically use summarized keywords like 'best tacos New York City' rather than complete sentences.

19. Why might two users receive different answers when asking the same question to an AI model at the exact same time?
19. AI language models are nondeterministic, meaning they can produce different outputs even when given identical inputs at the same time. This occurs because of how the models generate responses using probability distributions for the next most likely tokens.

20. How can you improve the consistency and output quality of AI responses in applications?
20. You can improve consistency by including instructions in your prompts that ask the AI to seek clarification when needed. For example, adding 'If you have any other questions for me, make sure you ask those first before you start to implement this feature' or 'If you don't understand what I'm saying, make sure that you come and check with me first' can significantly improve the quality of responses.