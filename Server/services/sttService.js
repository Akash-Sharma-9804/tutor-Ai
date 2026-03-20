/**
 * sttService.js — AssemblyAI Universal Streaming STT (v3)
 *
 * Identical to the original working version PLUS one addition:
 * "partial-stable shortcut" — if a partial transcript hasn't changed for
 * PARTIAL_STABLE_MS, fire it as a final immediately without waiting for
 * AssemblyAI's server-side silence detection (saves ~700-1000ms latency).
 * The real turn_is_formatted final is deduplicated so it never fires twice.
 */

const WebSocket   = require('ws');
const querystring = require('querystring');

const ASSEMBLYAI_V3_URL = 'wss://streaming.assemblyai.com/v3/ws';
const SAMPLE_RATE        = 16000;

// Fire an early final if partial text hasn't changed for this long
// Raised from 900 to 1400ms: prevents mid-sentence partials firing as finals
const PARTIAL_STABLE_MS = 1400;

class STTSession {
  constructor({ onTranscript, onError, onClose }) {
    this.ws           = null;
    this.onTranscript = onTranscript;
    this.onError      = onError;
    this.onClose      = onClose;
    this.isConnected  = false;

    // Partial-stable shortcut state
    this._lastPartial    = '';
    this._stableTimer    = null;
    this._lastFiredFinal = '';  // deduplicate — never fire same text twice
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const apiKey = process.env.ASSEMBLYAI_API_KEY;
      if (!apiKey) {
        reject(new Error('ASSEMBLYAI_API_KEY not set'));
        return;
      }

      // v3: params go in query string, auth goes in header
      const params = querystring.stringify({
        sample_rate:  SAMPLE_RATE,
        format_turns: true,   // keep true — stable, reliable connection
      });

      this.ws = new WebSocket(`${ASSEMBLYAI_V3_URL}?${params}`, {
        headers: { Authorization: apiKey },
      });

      this.ws.on('open', () => {
        this.isConnected = true;
        console.log('[STT] AssemblyAI v3 session opened');
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          this._handleMessage(JSON.parse(data.toString()));
        } catch (e) {
          console.error('[STT] Parse error:', e.message);
        }
      });

      this.ws.on('error', (err) => {
        console.error('[STT] WebSocket error:', err.message);
        this.isConnected = false;
        if (this.onError) this.onError(err);
        reject(err);
      });

      this.ws.on('close', (code) => {
        this.isConnected = false;
        clearTimeout(this._stableTimer);
        this._stableTimer = null;
        console.log(`[STT] Closed: ${code}`);
        if (this.onClose) this.onClose(code);
      });
    });
  }

  _fireFinal(text) {
    if (!text || text === this._lastFiredFinal) return; // deduplicate
    this._lastFiredFinal = text;
    this._lastPartial    = '';
    clearTimeout(this._stableTimer);
    this._stableTimer = null;
    console.log('[STT] Final:', JSON.stringify(text));
    this.onTranscript?.({ type: 'final', text });
  }

  _handleMessage(msg) {
    switch (msg.type) {
      case 'Begin':
        console.log('[STT] Session begun, id:', msg.id);
        break;

      case 'Turn': {
        const text = (msg.transcript || '').trim();
        if (!text) break;

        if (msg.turn_is_formatted) {
          // Real formatted final — cancel stable timer, fire (deduped)
          clearTimeout(this._stableTimer);
          this._stableTimer = null;
          this._fireFinal(text);
        } else {
          // Partial — emit immediately for live UI display
          this.onTranscript?.({ type: 'partial', text });

          // If text changed, reset stable timer
          if (text !== this._lastPartial) {
            this._lastPartial = text;
            clearTimeout(this._stableTimer);
            // If partial hasn't changed for PARTIAL_STABLE_MS → treat as final now
            this._stableTimer = setTimeout(() => {
              console.log('[STT] Partial stable → early final');
              this._fireFinal(this._lastPartial);
            }, PARTIAL_STABLE_MS);
          }
        }
        break;
      }

      case 'Termination':
        // Flush anything still pending
        if (this._lastPartial) this._fireFinal(this._lastPartial);
        console.log('[STT] Session terminated by server');
        break;

      default:
        break;
    }
  }

  sendAudio(audioBuffer) {
    if (!this.isConnected || !this.ws) return;
    if (this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(audioBuffer);
    } catch (e) {
      console.error('[STT] Send error:', e.message);
    }
  }

  terminate() {
    clearTimeout(this._stableTimer);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: 'Terminate' }));
      } catch (_) {}
      this.ws.close();
    }
    this.isConnected = false;
  }
}

const createSTTSession = (callbacks) => new STTSession(callbacks);
module.exports = { createSTTSession };