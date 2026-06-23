

const MODELS = [
 'llama-3.3-70b-versatile',
 'llama-3.1-8b-instant',
 'gemma2-9b-it'
];

let currentModelIndex = 0;

/**
 * Streams AI response using the Groq API. 
 * Automatically falls back to other models if a quota error is encountered.
 * 
 * @param {string|Array} contents - The text prompt or structured contents array (Gemini format).
 * @param {object} options - Contains callbacks: onStart, onChunk, onError, onComplete, and signal.
 */
export const streamAiResponse = async (contents, options = {}) => {
 const { onStart, onChunk, onError, onComplete, signal, config = {} } = options;
 
 let attempts = 0;
 const maxAttempts = MODELS.length;

 while (attempts < maxAttempts) {
 const model = MODELS[currentModelIndex];
 const url = `${import.meta.env.VITE_BACKEND_URL}/api/ai/chat`;

 // 1. Convert Gemini format to OpenAI/Groq format
 const messages = [];
 
 // System Instruction
 if (options.systemInstruction) {
 messages.push({
 role: 'system',
 content: options.systemInstruction.parts[0].text
 });
 }

 // Chat History or Prompt
 const payloadContents = typeof contents === 'string' 
 ? [{ role: 'user', parts: [{ text: contents }] }] 
 : contents;
 
 for (const msg of payloadContents) {
 messages.push({
 role: msg.role === 'model' ? 'assistant' : msg.role,
 content: msg.parts[0].text
 });
 }

 try {
 const payload = {
 model: model,
 messages: messages,
 temperature: config.temperature || 0.6,
 max_tokens: config.maxOutputTokens ? Math.min(config.maxOutputTokens, 8192) : 2048,
 stream: true
 };

 const sessionToken = config.token || JSON.parse(localStorage.getItem('ravenx_session') || '{}')?.token;

 const response = await fetch(url, {
 method: 'POST',
 headers: { 
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${sessionToken}`
 },
 signal,
 body: JSON.stringify(payload)
 });
 console.log(`[AI Manager] Fetch response status: ${response.status}`);

 if (!response.ok) {
 if (response.status === 429 || response.status === 404 || response.status === 503 || response.status === 400) {
 console.warn(`[AI Manager] Model ${model} returned ${response.status}. Falling back...`);
 currentModelIndex = (currentModelIndex + 1) % MODELS.length;
 attempts++;
 if (attempts >= maxAttempts) {
 throw new Error(`All fallback AI models have been exhausted. Please wait for API quotas to reset.`);
 }
 continue; // Retry with next model
 }
 const errText = await response.text();
 throw new Error(`API Error ${response.status}: ${errText}`);
 }

 // Successful connection, trigger onStart if it's the first time
 if (onStart) onStart(model);

 console.log(`[AI Manager] Connection established. Reading Groq stream...`);
 const reader = response.body.getReader();
 const decoder = new TextDecoder();
 let buffer = '';

 while (true) {
 const { done, value } = await reader.read();
 if (done) break;

 buffer += decoder.decode(value, { stream: true });
 const lines = buffer.split('\n');
 buffer = lines.pop() || '';

 for (const line of lines) {
 if (line.startsWith('data: ')) {
 const dataStr = line.slice(6).trim();
 if (!dataStr || dataStr === '[DONE]') continue;
 try {
 const data = JSON.parse(dataStr);
 // Groq / OpenAI delta content
 const textChunk = data.choices?.[0]?.delta?.content || '';
 if (textChunk && onChunk) {
 onChunk(textChunk);
 }
 } catch (e) {
 console.error("[AI Manager] JSON parse error on chunk:", dataStr, e);
 }
 }
 }
 }
 
 // Fully completed streaming successfully
 if (onComplete) onComplete();
 return; // Exit loop

 } catch (err) {
 if (err.name === 'AbortError') {
 throw err; // Let abort bubble up
 }
 
 // If it's a non-429 error or we've run out of models
 if (attempts === maxAttempts - 1) {
 console.error("[AI Manager Error]", err);
 if (onError) onError(err);
 return;
 }
 
 // Otherwise increment and retry for other unknown fetch errors
 console.warn(`[AI Manager] Model ${model} failed with ${err.message}. Retrying...`);
 currentModelIndex = (currentModelIndex + 1) % MODELS.length;
 attempts++;
 }
 }
};
