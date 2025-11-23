import * as tf from "@tensorflow/tfjs";

// Paths to TFJS MobileBERT model and vocabulary files (hosted locally or via CDN)
const MODEL_URL = "https://tfhub.dev/tensorflow/tfjs-model/mobilebert/1/default/1/model.json";
const VOCAB_URL = "https://tfhub.dev/tensorflow/tfjs-model/mobilebert/1/default/1/vocab.json";

// Loads tokenizer vocabulary and builds mapping for tokenization
export async function loadTokenizer() {
  const vocabResponse = await fetch(VOCAB_URL);
  const vocab = await vocabResponse.json();
  return new Tokenizer(vocab);
}

// Simple tokenizer for MobileBERT
class Tokenizer {
  constructor(vocab) {
    this.vocab = vocab;
    this.invVocab = {};
    for (const [token, idx] of Object.entries(vocab)) this.invVocab[idx] = token;
  }

  tokenize(text) {
    // Simple whitespace tokenizer; real MobileBERT uses WordPiece, but approximation for demo
    const tokens = text.trim().toLowerCase().split(/\s+/);
    const tokenIds = tokens.map(t => this.vocab[t] || this.vocab["[UNK]"] || 100);
    return tokenIds;
  }
}

// Preprocess text into input tensors for MobileBERT
export function preprocessText(text, tokenizer) {
  const tokenIds = tokenizer.tokenize(text);
  const maxLen = 32; // limit length
  let inputIds = new Array(maxLen).fill(0);
  for (let i = 0; i < Math.min(tokenIds.length, maxLen); i++) {
    inputIds[i] = tokenIds[i];
  }
  const inputTensor = tf.tensor2d([inputIds], [1, maxLen], "int32");

  // MobileBERT expects multiple inputs, here we pass inputIds only
  return { input_ids: inputTensor };
}

// Load MobileBERT TFJS model
export async function loadMobileBertModel() {
  return await tf.loadGraphModel(MODEL_URL, { fromTFHub: true });
}
