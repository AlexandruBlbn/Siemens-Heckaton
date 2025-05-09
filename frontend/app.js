document.addEventListener('DOMContentLoaded', () => {
    // Lista de comenzi permise (în lowercase)
    const KEYWORDS = ['paracetamol', 'aspirină', 'parasinus', 'septogal'];
  
    // Legături UI
    const btn = document.getElementById('start-btn');
    const recognized = document.getElementById('recognized');
    const status = document.getElementById('status');
  
    if (!btn || !recognized || !status) {
      console.error('Elemente UI lipsă:', { btn, recognized, status });
      return;
    }
  
    // Inițializare SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browserul nu suportă Web Speech API');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ro-RO';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    // Inițializare Web Audio API pentru beep-uri
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq = 440, dur = 150, vol = 5) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur/1000);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + dur/1000);
    }
  
    // Evenimente SpeechRecognition
    recognition.addEventListener('start', () => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      playBeep(800, 200, 5);
      recognized.innerHTML = 'Medicament recunoscut: <span class="font-medium">—</span>';
      status.textContent = 'Status: ascult...';
    });
    recognition.addEventListener('speechstart', () => console.log('speechstart'));
    recognition.addEventListener('speechend', () => console.log('speechend'));
    recognition.addEventListener('error', e => {
      console.error('SR Error:', e.error);
      status.textContent = `Status: Eroare (${e.error})`;
      playBeep(300, 200, 5);
    });
    recognition.addEventListener('end', () => playBeep(400, 200, 5));
  
    // Start recognition on button click
    btn.addEventListener('click', () => {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      recognition.start();
    });
  
    // Handle result
    recognition.addEventListener('result', e => {
      const transcript = e.results[0][0].transcript.trim();
      recognized.innerHTML = `Medicament recunoscut: <strong>${transcript}</strong>`;
      status.textContent = 'Status: trimit la server…';
  
      const cmd = KEYWORDS.find(k => transcript.toLowerCase().includes(k));
      if (!cmd) {
        status.textContent = '❌ Medicament necunoscut';
        return;
      }
      sendToServer(cmd);
    });
  
    // Trimite comanda la server
    function sendToServer(cmd) {
      fetch('http://172.31.5.254:5000/api/medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd })
      })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(json => {
        console.log('Server răspunde:', json);
        status.textContent = `✓ ${json.message}`;
      })
      .catch(err => {
        console.error('API Error:', err);
        status.textContent = `Status: eroare server (${err.message})`;
      });
    }
  });
  