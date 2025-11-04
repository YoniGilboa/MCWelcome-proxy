const OpenAI = require('openai').default;
const openai = new OpenAI({ apiKey: 'test' });
console.log('Checking OpenAI SDK methods...');
console.log(typeof openai.beta.threads.runs.retrieve);
