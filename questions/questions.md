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