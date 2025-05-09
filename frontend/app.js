/**
 * app.js
 *
 * Frontend logic pentru recunoaștere vocală și trimiterea comenzilor către server prin WebSocket.
 * Folosește Web Speech API, Web Audio API (pentru beep-uri) și Socket.IO client.
 */

// Așteaptă încărcarea DOM înainte de inițializare
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lista de cuvinte cheie permise (în lowercase)
    const KEYWORDS = ['paracetamol', 'aspirină', 'parasinus', 'septogal'];
  
    // 2. Referințe către elementele UI
    const btn        = document.getElementById('start-btn');
    const recognized = document.getElementById('recognized');
    const status     = document.getElementById('status');
  
    // Verifică existența elementelor
    if (!btn || !recognized || !status) {
      console.error('Elemente UI lipsă:', { btn, recognized, status });
      return;
    }
  
    // 3. Inițializare WebSocket (Socket.IO)
    const socket = io('http://172.31.5.254:5000');
  
    // 3a. Eveniment la conectare
    socket.on('connect', () => {
      console.log('WebSocket conectat:', socket.id);
      status.textContent = 'Status: WebSocket conectat';
    });
  
    // 3b. Mesaj server (status)
    socket.on('status', data => {
      console.log('WS status:', data.message);
      status.textContent = `Status: ${data.message}`;
    });
  
    // 3c. Rezultatul comenzii de la server
    socket.on('result', data => {
      console.log('WS result:', data);
      status.textContent = data.status === 'ok'
        ? `✓ ${data.message}`
        : `❌ ${data.message}`;
    });
  
    // 4. Inițializare SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browserul nu suportă Web Speech API');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ro-RO';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    // 5. Setup Web Audio API pentru beep-uri
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq = 440, dur = 150, vol = 5) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur / 1000);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + dur / 1000);
    }
  
    // 6. Handlers SpeechRecognition
    recognition.addEventListener('start', () => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      playBeep(800, 200, 5);
      recognized.innerHTML = 'Medicament recunoscut: <span class="font-medium">—</span>';
      status.textContent   = 'Status: ascult...';
    });
    recognition.addEventListener('speechstart', () => console.log('speechstart'));
    recognition.addEventListener('speechend',   () => console.log('speechend'));
    recognition.addEventListener('error', e => {
      console.error('SR Error:', e.error);
      status.textContent = `Status: Eroare (${e.error})`;
      playBeep(300, 200, 5);
    });
    recognition.addEventListener('end', () => playBeep(400, 200, 5));
  
    // 7. Începe recunoașterea la click
    btn.addEventListener('click', () => {
      recognition.start();
    });
  
    // 8. Procesare rezultat vocal și transmitere prin WebSocket
    recognition.addEventListener('result', e => {
      const transcript = e.results[0][0].transcript.trim();
      recognized.innerHTML = `Medicament recunoscut: <strong>${transcript}</strong>`;
      status.textContent   = 'Status: trimit WS…';
      console.log('📝 Transcript:', transcript);
  
      // Găsește un keyword permise
      const cmd = KEYWORDS.find(k => transcript.toLowerCase().includes(k));
      if (!cmd) {
        status.textContent = '❌ Medicament necunoscut';
        return;
      }
  
      // Trimite comanda prin WebSocket
      socket.emit('command', { cmd });
    });
  });
  