import { OpenAI } from 'openai';

function getOpenAIClient(apiKey?: string) {
    return new OpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY
    });
}

/**
 * Generates a changelog summary from git diff using OpenAI API
 */
export async function generateChangelogSummary(diff: string, apiKey?: string): Promise<string> {
    try {
        const openai = getOpenAIClient(apiKey);
        const prompt = `Given the following git diff, please generate a changelog summary in the following format:
- feat/fix/chore/docs/etc: Main change description
    - Detailed change 1
    - Detailed change 2

Only include significant changes and group similar changes together.
Focus on the user-facing changes and improvements.

Git diff:
${diff}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful assistant that generates clear and concise changelog entries from git diffs.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        return response.choices[0].message.content || 'No changes to describe';
    } catch (error) {
        console.error('Error generating changelog summary:', error);
        throw error;
    }
}
