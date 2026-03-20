document.addEventListener('DOMContentLoaded', () => {
  const quizGrid = document.getElementById('quizGrid');
  const quizInterface = document.getElementById('quizInterface');
  const quizTitle = document.getElementById('quizTitle');
  const timerEl = document.getElementById('timer');
  const questionsContainer = document.getElementById('questionsContainer');
  const quizForm = document.getElementById('quizForm');

  let timerInterval = null;
  let timeRemaining = 0;
  let currentQuizData = null; 
  let currentStudentName = "Student";

  function loadAvailableQuizzes() {
    quizGrid.innerHTML = '<h2>Loading quizzes...</h2>';
    fetch('/api/get_quizzes')
      .then(res => res.json())
      .then(quizzes => {
        quizGrid.innerHTML = '';
        if (quizzes.length === 0) {
          quizGrid.innerHTML = '<p>No quizzes available right now.</p>';
          return;
        }

        quizzes.forEach(quiz => {
          const card = document.createElement('div');
          card.className = 'quiz-card';
          card.innerHTML = `
            <h2>${quiz.title}</h2>
            <p class="muted">${quiz.module} - ${quiz.type}</p>
            <div class="quiz-meta">
              <div><strong>${quiz.duration}</strong> mins</div>
              <div><strong>${quiz.questions.length}</strong> Qs</div>
              <div><strong>${quiz.marks}</strong> Marks</div>
            </div>
            <button class="btn primary start-btn">Start Quiz</button>
          `;
          
          card.querySelector('.start-btn').addEventListener('click', () => {
            currentStudentName = prompt("Enter your name to start:") || "Anonymous Student";
            startQuiz(quiz);
          });
          quizGrid.appendChild(card);
        });
      })
      .catch(err => console.error(err));
  }

  function startQuiz(quiz) {
    currentQuizData = quiz;
    quizGrid.classList.add('hidden');
    quizInterface.classList.remove('hidden');
    quizTitle.textContent = quiz.title;
    timeRemaining = parseInt(quiz.duration, 10) * 60;
    
    questionsContainer.innerHTML = '';

    quiz.questions.forEach((q, idx) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question';
      qDiv.innerHTML = `<h3>Q${idx + 1}: ${q.text}</h3>`;

      q.options.forEach(opt => {
        const label = document.createElement('label');
        label.style.display = "block";
        const input = document.createElement('input');
        input.type = q.type === 'single' ? 'radio' : 'checkbox';
        input.name = `q${idx}`;
        input.value = opt;
        
        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + opt));
        qDiv.appendChild(label);
      });
      questionsContainer.appendChild(qDiv);
    });

    startTimer();
  }

  function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        quizForm.requestSubmit(); 
      }
      updateTimerDisplay();
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
    const seconds = String(timeRemaining % 60).padStart(2, '0');
    timerEl.textContent = `${minutes}:${seconds}`;
  }

  quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearInterval(timerInterval);

    let score = 0;
    const total = currentQuizData.questions.length;

    currentQuizData.questions.forEach((q, idx) => {
      const selected = Array.from(document.querySelectorAll(`input[name="q${idx}"]:checked`)).map(el => el.value);
      const correct = q.correct_answers || [];
      const isCorrect = selected.length === correct.length && selected.every(val => correct.includes(val));
      if (isCorrect) score++;
    });

    fetch('/api/submit_score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: currentStudentName,
        quiz_title: currentQuizData.title,
        score: score,
        total: total
      })
    });

    quizInterface.classList.add('hidden');
    
    // FOOLPROOF RESULTS FIX: Forcefully show any results block and inject score
    const resultSections = document.querySelectorAll('.results');
    resultSections.forEach(sec => sec.classList.remove('hidden'));
    
    const rc = document.getElementById('resultsContent');
    const sd = document.getElementById('scoreDisplay');
    const resultText = `<h2 style="color: #5cc8ff; font-size: 2rem; margin-top: 20px;">You scored ${score} out of ${total}!</h2>`;
    
    if (rc) rc.innerHTML = resultText;
    if (sd) sd.innerHTML = resultText;
  });

  // FOOLPROOF BACK BUTTON FIX: Catch clicks on any "back" button
  document.body.addEventListener('click', (e) => {
    if (e.target.id === 'backToQuizzes') {
      document.querySelectorAll('.results').forEach(sec => sec.classList.add('hidden'));
      quizGrid.classList.remove('hidden');
      loadAvailableQuizzes();
    }
  });

  loadAvailableQuizzes();
});