// Lista de comenzi permise (în lowercase)
const KEYWORDS = [
    'paracetamol',  
    'aspirina',   
    'parasinus',       
    'septogal',     
  ];
  

//  Inițializare SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert('Browserul nu suportă Web Speech API');
  throw new Error('No SpeechRecognition');
}
const recognition = new SpeechRecognition();

//  Setări
recognition.lang = 'ro-RO';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

//  Legături UI
const btn = document.getElementById('start-btn');
const status = document.getElementById('status');

//  Debug events
recognition.addEventListener('start',        () => console.log('🎤 SpeechRecognition start'));
recognition.addEventListener('speechstart',  () => console.log('🗣️ speechstart'));
recognition.addEventListener('speechend',    () => console.log('✋ speechend'));
recognition.addEventListener('result',       (e) => console.log('📝 result event:', e.results[0][0].transcript));
recognition.addEventListener('end',          () => console.log('🏁 SpeechRecognition end'));
recognition.addEventListener('error',        e => {
  console.error('❌ SR Error:', e.error);
  status.textContent = `Eroare voce: ${e.error}`;
});

//  La click, pornești recunoașterea
btn.addEventListener('click', () => {
  recognition.start();
  status.textContent = 'Stare: ascult...';
});

//  Când vine un rezultat final
recognition.addEventListener('result', (e) => {
    const transcript = e.results[0][0].transcript.trim().toLowerCase();
    console.log('📝 Transcript:', transcript);
  
    // Găsește un keyword
    const cmd = KEYWORDS.find(k => transcript.includes(k));
    if (cmd) {
      status.textContent = `Comandă recunoscută: ${cmd}`;
      mockExecute(cmd);
    } else {
      status.textContent = `Nu e o comandă validă. Ai spus: “${transcript}”`;
    }
});

//  (Opțional) re-pornește automat recognition la sfârșit
//recognition.addEventListener('end', () => recognition.start());
//  Mock-execute: simulează backend-ul/RPi-ul
function mockExecute(cmd) {
    console.log(`🚀 mockExecute(${cmd})`);
    // afișează că începe execuția
    status.textContent = `Execut ${cmd}…`;
  
    // simulăm latență de rețea / hardware
    setTimeout(() => {
      status.textContent = `✔️ Mock: ${cmd} executat cu succes`;
    }, 1000);
  }
  

// Funcția de trimitere text → backend/mock
function sendText(cmd) {
  console.log('🔥 sendText called cu:', cmd);
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cmd })
  })
  .then(r => r.json())
  .then(j => {
    console.log('✅ Mock server răspunde:', j);
    status.textContent = `Mock răspuns ID=${j.id}`;
  })
  .catch(e => {
    console.error('❌ Eroare la fetch():', e);
    status.textContent = 'Eroare trimitere!';
  });
}
