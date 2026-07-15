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

21. What is the primary advantage of using GitHub Copilot or Cursor over using a standard chat interface when working with AI assistants for code generation?
21. GitHub Copilot and Cursor can directly edit your code within the IDE instead of requiring you to copy and paste code back and forth between a chat interface and your editor, which makes the workflow less messy and more efficient.

22. What is the purpose of the Live Server extension in VS Code when working with HTML, CSS, and JavaScript files?
22. Live Server allows you to quickly run and view your HTML, CSS, and JavaScript files in a browser by clicking a 'Go Live' button, which launches a localhost server to display your application without needing additional setup or dependencies.

23. In GitHub Copilot, what are the three main modes available at the bottom of the chat interface, and what is each used for?
23. The three modes are: Agent mode (for building with and having the AI build for you), Ask mode (for asking questions about your code, such as what it's doing or how it works), and Edit mode (for editing code in context).

24. How can you add context to your AI assistant in GitHub Copilot, and what context is automatically included?
24. You can add context by clicking the context area or using the pound/hashtag symbol to reference specific files, extensions, or commands. Any file you are currently viewing or have open in your editor is automatically included in the context.

25. What is a key benefit of using AI coding assistants like GitHub Copilot or Cursor in terms of model selection?
25. These tools provide access to multiple AI models from different providers, allowing you to choose different models based on your needs—such as using smaller models for simple tasks to save budget, or switching between providers like GPT and Claude to compare their behaviors and capabilities.

26. When using the Live Server extension in VS Code, what command or action allows you to launch the local development server?
26. Click the 'Go Live' button or right-click and choose 'Open'. This will start the Live Server and typically open the application at localhost:5500.

27. What keyboard shortcut adds a new line when typing a prompt in the chat interface instead of sending the message?
27. Shift-Return (or Shift-Enter) adds a new line without sending the prompt.

28. In Copilot's chat interface, what does the 'Restore to Last Checkpoint' feature do?
28. It undoes all changes back to the most recent prompt, effectively reverting everything generated in the current conversation checkpoint. This is useful when you want to discard unsatisfactory results and start over.

29. What are the limitations of using a 'standard prompt' when generating code with AI assistants?
29. Standard prompts often produce code with extra features not requested (like export buttons or search bars), may contain bugs (like non-functional save buttons), and don't provide enough specificity to get exactly what you need. They require more iterative refinement to achieve the desired result.

30. What three core files does an AI assistant typically generate when creating a basic web application with HTML, CSS, and JavaScript?
30. index.html (the main HTML structure), style.css (the styling), and script.js (the JavaScript functionality). The assistant may also update or create a readme file with documentation.

31. What is zero-shot prompting and how does it differ from standard prompting?
31. Zero-shot prompting is a direct task request without any examples, where the model relies entirely on its pre-training knowledge. While all zero-shot prompts are standard prompts, not all standard prompts are truly zero-shot. Zero-shot prompts are typically more verbose and specific, breaking down exactly what is needed step-by-step, whereas standard prompts are more basic, often just one question or one line with a very indirect ask of a task.

32. When is it recommended to start a new chat session with an AI model?
32. It's recommended to start a new chat when: 1) the chat becomes really long (even if it's good, summarize it first and move to a new one), 2) when things have gone significantly wrong or "wonky", 3) when stuck in a bug loop where the model keeps claiming to fix issues but the bug persists. Before starting over, you can ask the model to summarize the conversation, tone, and provide examples to carry context into the new chat.

33. What factors affect the quality of outputs from zero-shot prompts?
33. The quality of zero-shot prompt outputs varies based on task complexity and specificity. The more complex the task, the harder it will be for the model to give a good response. However, the more specific you can be with your zero-shot prompt, the better the output will be. Breaking down tasks to be as specific and as small as possible leads to better results.

34. When are zero-shot prompts most effective to use?
34. Zero-shot prompts work really well for simple, common tasks. They are also good when you don't need a very specific format coming out of the prompt - for instance, when it doesn't matter if the response is a sentence, paragraph, or chunk of code. They're ideal for tasks where the model's pre-training knowledge (trained on terabytes of data and billions of parameters) is sufficient to understand the request.

35. In the following zero-shot prompt example, what makes it more effective than a basic standard prompt?

Create a Prompt Library application in HTML, CSS, and JavaScript.
Create an HTML page with a form containing fields for the prompt title and content.
Add a save prompt button that saves to local storage.
Display saved prompts in cards.
Each prompt card should show the title, a content preview of a few words, and a delete button.
Deleting should remove a prompt from local storage and update the display.
Includes no other features.
Do not add other dependencies.
Do not add any other features than I had listed.

35. This prompt is more effective because it provides high specificity with low complexity. It breaks down exactly what features are needed step-by-step, explicitly states what NOT to include (no other features, no other dependencies), and focuses on only the essential functionality (save and delete). This specificity helps prevent the model from adding unwanted features like export buttons or search functionality that weren't requested.

36. What are some key differences between AI models that should be considered when selecting one for an application?
36. Different models vary in several ways: some are faster while others are slower, some are better at making things look good at first pass, while others excel at handling complex logic. Additionally, models differ significantly in cost, which can impact whether they're worth using for a particular application, especially when running operations thousands of times per day.

37. Why is it important to write flexible code when building AI applications?
37. Models can be deprecated with little notice, and new tools can appear or disappear unexpectedly in the AI landscape. Writing flexible code and prompts ensures that you can switch between different models and providers quickly if needed, without major code rewrites.

38. When comparing Haiku and Sonnet 4 for a classification system, what was the primary factor in deciding which model to use?
38. The primary factor was cost versus accuracy. Sonnet 4 was at least 80% more expensive than Haiku, and when running the classification thousands of times per day, it was important to determine if Haiku provided accurate enough information. Since Haiku was 99% accurate for the use case, the additional cost of Sonnet 4 wasn't justified.

39. What approach should developers take when evaluating AI models and providers?
39. Developers should try multiple models and multiple providers rather than sticking with only familiar tools. It's important to evaluate different options based on actual needs, as different providers offer models with varying capabilities and pricing. This includes giving fair consideration to models from different providers, even if there was initial skepticism about them.

40. What factors might cause a need to switch AI models in a production application?
40. Several factors can necessitate switching models: the current model being deprecated, new models becoming available with better pricing, changes in accuracy requirements, or new models offering better performance characteristics. Cost changes can also be a factor, as newer versions of expensive models might become more affordable, or older models from different providers might offer sufficient capabilities at lower costs.

41. What is one-shot prompting and how does it differ from zero-shot prompting?
41. One-shot prompting is providing exactly one example with your request to an LLM, whereas zero-shot prompting provides zero examples. In one-shot prompting, the model learns the pattern, format, and style from the single example provided, which helps prime and train the model for the desired output.

42. What is the "show don't tell" principle in the context of one-shot prompting?
42. The "show don't tell" principle means it's more effective to provide a single example of the desired output format rather than writing lengthy paragraphs of instructions about what to do and not do. Showing an example of what you want the output to mimic is often easier and more effective than describing it in detail.

43. What type of example should be chosen for one-shot prompting and why?
43. A generalized case should be chosen as the example, not an edge case. The example should be the majority representative and not overly complex, because the model will generalize this as the pattern for all future outputs. Including edge cases or overly complex examples may cause the model to treat those complexities as the standard pattern.

44. What are the key elements that should be included in a one-shot prompting example?
44. The example should include all elements you want in your output. For instance, if you want JSON output with specific keys, you need to include all those keys in your example. The model won't know to include elements that aren't present in the example you provide.

45. What is a limitation of one-shot prompting based on its ability to control outputs?
45. One-shot prompting still isn't perfect for controlling outputs consistently. While it produces better and more relevant outputs by providing a pattern to follow, it may not always maintain consistent formatting or structure across different responses. Additional techniques need to be combined with one-shot prompting if precise output control is required, especially when passing answers from models to the next step in an application.

46. What is one-shot prompting and how does it differ from a standard prompt?
46. One-shot prompting involves providing an AI assistant with a single example of how to complete a task before asking it to perform a similar task. Unlike standard prompts that just ask for something directly, one-shot prompting includes an example format or structure to guide the AI's response, giving you more control over the output format and approach.

47. When implementing a new feature using one-shot prompting, why is it beneficial to ask for a plan first rather than immediately implementing code?
47. Asking for a plan first allows you to review and pare down the proposed implementation before any code is written. This gives you better control over code quality, lets you identify unnecessary features or complexity, and ensures you agree with the approach before implementation. It prevents the AI from adding unwanted features or frameworks and allows you to make adjustments to the plan before committing to code changes.

48. What key components should be included when structuring a one-shot prompt for a feature implementation?
48. A well-structured one-shot prompt for feature implementation should include: 1) A user story describing the feature need, 2) Technical requirements with bullet points, 3) Code structure with examples showing how to implement it, and 4) UX considerations for the user interface. This format provides a comprehensive example that guides the AI to respond in the same structured manner.

49. How can you effectively use AI assistants to create better prompts?
49. AI assistants are capable at crafting prompts for themselves. You can ask them to help break down complex tasks into smaller tasks and then help create the prompt. You can specify a particular prompting technique you want to use (like one-shot prompting) and ask for help creating a good example. You can also ask the AI to help parse down or make your prompts more efficient.

50. What is a practical benefit of using one-shot prompting for study or learning purposes?
50. One-shot prompting can be used to create personalized study guides by providing an example of your preferred learning format. For instance, you can show the AI an example where it asks a question, you answer, and it rates your answer as correct or incorrect with explanations for wrong answers. This creates a customized learning experience that can be tailored to your specific learning style and needs.

51. What is few-shot prompting and when should it be used?
51. Few-shot prompting involves providing two or more examples in a prompt. It should be used when dealing with complex logic, multiple formats to consider, and various edge cases. The examples help establish patterns and allow the model to learn nuances and variations from diverse inputs and outputs.

52. According to the research paper "Language Models are Few-Shot Learners," how does few-shot prompting effectiveness change as language models get larger?
52. Few-shot prompting shows an exponential increase in accuracy as language models get larger. While zero-shot and one-shot prompting techniques also got more effective with larger models, few-shot prompting improved more rapidly, making it particularly effective for complex tasks with modern large language models.

53. What is the ideal number of examples to include in a few-shot prompt, and what happens if too many are provided?
53. The ideal number is typically four to eight examples. Diminishing returns are seen after ten examples, and some models actually degrade in performance with too many shots. The most important factors are that examples should be diverse and high-quality rather than simply numerous.

54. What are the recommended best practices for creating effective few-shot prompts?
54. Best practices include: ensuring diversity in examples, including edge cases and failure cases, keeping examples concise but complete without sacrificing quality, and testing different numbers of examples across multiple chats to determine optimal performance for the specific use case and model.

55. What types of tasks are most suitable for few-shot prompting?
55. Few-shot prompting is most suitable for: complex patterns with multiple variations, classification tasks with many categories, standardizing formats with diverse inputs, and domain-specific tasks that require specialized context (such as working in a large codebase with domain-specific knowledge).

56. What is a key advantage of few-shot prompting compared to simpler prompting techniques when working with LLMs?
56. Few-shot prompting allows you to complete larger and more complex tasks in one prompt because you're providing multiple examples to the model, which makes it acceptable to increase the complexity and scope of your request.

57. In few-shot prompting for feature implementation, what are the four key components that should be included in each example prompt according to the pattern shown?
57. Each example prompt should include: 1) A clear feature description, 2) Specific technical requirements, 3) Implementation details, and 4) Expected deliverables with a data structure and integration notes.

58. Why might you use an LLM to create a prompt for implementing a feature rather than asking it to directly write the code?
58. Creating a prompt first allows you to review and fine-tune the specifications, logic, and requirements before any code is actually implemented. This gives you the opportunity to catch problems with structure or logic, or to add or remove important details before moving to the implementation phase.

59. What challenge is associated with few-shot prompting when providing multiple examples?
59. Few-shot prompting requires significant human engineering effort because the prompts become very long and difficult to create. Providing multiple shots (especially 8 or more examples) takes considerable time and effort to not only write out but to get right.

60. What strategy can be used at the end of a prompt to prevent LLMs from adding extra features beyond the specified scope?
60. You should explicitly instruct the model to keep the implementation simple and within scope by adding instructions like "Keep it as simple as possible to create a working [feature] with only the features mentioned in your task" or "implement this feature with no additional features."

61. What percentage of prompts use few-shot prompting according to research, and why is it more commonly used for certain tasks?
61. Few-shot prompting is used approximately 15-20% of the time. It is more commonly used for complex tasks because few-shot prompting improved exponentially with larger models, whereas one-shot prompting improved but without the same growth rate. It's particularly valuable for complex use cases despite requiring extra time to craft additional examples.

62. What is the recommended approach when using an LLM to generate few-shot examples for prompts?
62. When having an LLM provide few-shot examples, you should review them carefully with a fine-tooth comb to ensure they look correct, verify the schema is appropriate if generating code, and check other relevant considerations before using them in your prompts.

63. How can you monitor token usage in prompts when working with OpenAI models?
63. You can use OpenAI's tokenizer tool to monitor token usage by copying and pasting your prompts to see how many tokens you're using. It's important to remember that tokens include your entire conversation history (input and output) and the system message, which all get appended every time you interact with the model.

64. When should you consider starting a new chat session with an LLM instead of continuing in the current context window?
64. You should consider starting a new chat session when the performance of the model begins to degrade. This degradation indicates that either something is lost from context or something is confusing the model within the current context window. For typical day-to-day use with models having over 100,000 tokens in their context window, this is rarely an issue.

65. What is the continue pattern and when should it be used with LLMs?
65. The continue pattern is used when an LLM response gets cut off mid-output. In Claude, ChatGPT, and Copilot, you can either click a 'continue' button if available or simply type the word 'continue' and press send, and the model will resume outputting the rest of its response from where it stopped.

66. In terms of information retention in prompts, how does the placement of critical information at the beginning, middle, and end of the context affect model performance?
66. The beginning of the prompt is best for information retention, followed by the end, with the middle being worst. Models struggle with the middle of long contexts, so critical information should go first and supporting details should go last.

67. What are primacy bias and recency bias, and how do they apply to large language models?
67. Primacy bias is the tendency to remember information better at the beginning of context, while recency bias is the tendency to remember information at the end. LLMs exhibit both of these biases, similar to human psychology, because they operate using neural networks.

68. According to the "Lost in the Middle" research paper, how did language model performance compare when the answer was in the middle of documents versus when no documents were provided at all?
68. When the answer was in the middle of the documents (roughly positions 7-16), the model performed worse than when no documents were provided at all. The model achieved approximately 56-57% accuracy with no context (closed book), but performed worse when the answer was buried in the middle of provided documents.

69. At approximately what token count does the "lost in the middle" problem begin to appear in language models?
69. The "lost in the middle" problem can start to appear at just a couple thousand tokens. This threshold can be reached quickly when considering system messages, user inputs, and other attached context.

70. What is the recommended approach when chat performance degrades or when a large amount of context has accumulated?
70. When chat performance degrades, such as when bugs keep reappearing or the model provides increasingly poor responses, it's recommended to start a new chat. This helps avoid the "lost in the middle" effect. Additionally, if important information was mentioned earlier, it should be brought up again as the chat grows to prevent it from getting lost in the middle of the context.

71. Why is structured output important when building AI applications with LLMs?
71. Structured output ensures consistent formats every time, which is critical when connecting an LLM to other parts of an application. Without structured output, you might receive a paragraph, sentence, array, or JSON object inconsistently, making it impossible to reliably process the data in subsequent application steps. It allows you to know exactly what format to expect and how to handle it.

72. What techniques can be used to enforce structured output format from an LLM?
72. You can use examples, templates, or schemas to enforce format. This involves explicitly telling the model the exact format you want, such as specifying field names and structures, and can include instructions like "return only the JSON, no explanation" to ensure you receive only the requested format without additional commentary.

73. What are some practical use cases where structured output is particularly beneficial?
73. Structured output is beneficial for test cases, documentation, data extraction, and code generation. It's useful anytime you need a specific format, are generating multiple similar items, or want to avoid manually reformatting responses. For example, when asking for code snippets, structured output allows you to simply copy and paste without reformatting.

74. How does structured output help with error handling in AI applications?
74. Since LLMs don't fail like traditional code (they hallucinate or send wrong output instead of error codes), structured output provides a way to detect failures. By expecting an exact format, especially in typed languages like TypeScript, you can detect when something went wrong if the output doesn't match the expected structure, enabling better error handling in AI applications.

75. Given the following prompt structure, what would the LLM return?

Extract the meeting details from this email.
Format like this:
Date: [date]
Time: [time]
Location: [location]
Topic: [topic]

Email: Let's meet tomorrow at 2 p.m. in conference room B to discuss the Q4 budget

75. The LLM would return the extracted information in the specified format:
Date: tomorrow
Time: 2 p.m.
Location: conference room B
Topic: Q4 budget

This demonstrates how structured output can extract specific information from unstructured text and format it consistently.