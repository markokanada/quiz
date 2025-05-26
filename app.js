let allQuestions = [];
let askedQuestions = new Set();
let score = 0;
let currentIndex = null;

const LS_KEY = "kvizAppData";


function escapeHTML(str) {
  return str?.replace(/</g, '&lt;').replace(/>/g, '&gt;') ?? '';
}


document.getElementById('fileInput').addEventListener('change', async function (e) {
  const file = e.target.files[0];
  if (file) {
    const text = await file.text();
    localStorage.setItem(LS_KEY, JSON.stringify({ md: text, asked: [], score: 0 }));
    loadFromStorage();
  }
});


document.getElementById('resetBtn').addEventListener('click', () => {
  localStorage.removeItem(LS_KEY);
  location.reload();
});


function loadFromStorage() {
  const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  if (saved.md) {
    parseQuestions(saved.md);
    askedQuestions = new Set(saved.asked || []);
    score = saved.score || 0;
    updateScore();
    nextQuestion();
  }
}


function saveProgress() {
  const currentData = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  localStorage.setItem(LS_KEY, JSON.stringify({
    md: currentData.md,
    asked: Array.from(askedQuestions),
    score
  }));
}


function parseQuestions(mdText) {
  const regex = /# (.*?)\n\n|## (\d+\..*?)\n([\s\S]*?)(?=\n##|\n#|$)/g;
  let currentTopic = '';
  let match;

  allQuestions = [];
  while ((match = regex.exec(mdText)) !== null) {
    if (match[1]) {
      currentTopic = match[1].trim();
    } else if (match[2]) {
      const questionText = match[2].replace(/^\d+\.\s*/, '').trim();
      const optionsRaw = match[3].split('<details>')[0];
      const options = [...optionsRaw.matchAll(/- \[.\] (.*?)\n/g)].map(o => o[1]);
      const correctMatch = match[3].match(/\*\*(.*?)\*\*/);
      const correct = correctMatch ? correctMatch[1].trim().slice(0, 1) : null;
      const explanation = match[3].split('<summary>Megoldás</summary>')[1]?.trim();

      allQuestions.push({
        topic: currentTopic,
        question: questionText,
        options,
        correct,
        explanation
      });
    }
  }
}


function nextQuestion() {
  const questionDiv = document.getElementById('question');
  const optionsDiv = document.getElementById('options');
  const feedback = document.getElementById('feedback');
  const topicDiv = document.getElementById('topic');
  const nextBtn = document.getElementById('nextBtn');
  const overrideBtn = document.getElementById('overrideBtn');

  feedback.textContent = '';
  nextBtn.style.display = 'none';
  overrideBtn.style.display = 'none';

  if (askedQuestions.size >= allQuestions.length) {
    questionDiv.innerHTML = "🎉 Végeztem! Teljesítmény: " + score + " / " + allQuestions.length;
    optionsDiv.innerHTML = '';
    topicDiv.innerHTML = '';
    return;
  }

  do {
    currentIndex = Math.floor(Math.random() * allQuestions.length);
  } while (askedQuestions.has(currentIndex));

  askedQuestions.add(currentIndex);
  const q = allQuestions[currentIndex];

  topicDiv.textContent = "Témakör: " + q.topic;
  questionDiv.innerHTML = escapeHTML(q.question);
  optionsDiv.innerHTML = '';

  q.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => {
      const selected = opt.slice(0, 1);
      const isCorrect = selected === q.correct;
      feedback.innerHTML = isCorrect
        ? `<div class="correct">✅ Helyes!<br>${escapeHTML(q.explanation)}</div>`
        : `<div class="incorrect">❌ Helytelen!<br>${escapeHTML(q.explanation)}</div>`;

      if (isCorrect) score++;
      else overrideBtn.style.display = 'inline';

      document.querySelectorAll('#options button').forEach(b => b.disabled = true);
      nextBtn.style.display = 'inline';
      updateScore();
      saveProgress();
    };
    optionsDiv.appendChild(btn);
  });
}

function updateScore() {
  document.getElementById('score').textContent = `Eddigi eredmény: ${score} / ${askedQuestions.size}`;
}

document.getElementById('nextBtn').onclick = nextQuestion;

document.getElementById('overrideBtn').onclick = () => {
  score++;
  updateScore();
  saveProgress();
  document.getElementById('overrideBtn').style.display = 'none';
};

