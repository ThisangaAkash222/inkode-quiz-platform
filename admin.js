document.addEventListener('DOMContentLoaded', () => {
  const questionsContainer = document.getElementById('questionsContainer');
  const addSingle = document.getElementById('addSingle');
  const addMultiple = document.getElementById('addMultiple');

  let questionCount = 0;

  // Function to add question inputs to the screen
  function createQuestion(type) {
    questionCount++;
    const qDiv = document.createElement('div');
    qDiv.className = 'question';

    const title = document.createElement('h3');
    title.textContent = `Question ${questionCount} (${type})`;
    qDiv.appendChild(title);

    const qInput = document.createElement('input');
    qInput.type = 'text';
    qInput.placeholder = 'Enter question text';
    qDiv.appendChild(qInput);

    // Create 5 Options
    for (let i = 1; i <= 5; i++) {
      const optDiv = document.createElement('div');
      optDiv.className = 'option';

      const optInput = document.createElement('input');
      optInput.type = 'text';
      optInput.placeholder = `Option ${i} text`;
      optDiv.appendChild(optInput);

      // Add radio button (single) or checkbox (multiple) to mark correct answers
      if (type === 'Single-answer') {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q${questionCount}`;
        optDiv.appendChild(radio);
      } else {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        optDiv.appendChild(checkbox);
      }
      
      optDiv.appendChild(document.createTextNode(' Mark as correct answer'));
      qDiv.appendChild(optDiv);
    }

    questionsContainer.appendChild(qDiv);
  }

  addSingle.addEventListener('click', () => createQuestion('Single-answer'));
  addMultiple.addEventListener('click', () => createQuestion('Multiple-answer'));

  // --- SUBMIT EVERYTHING TO PYTHON ---
  const quizForm = document.getElementById('quizForm');
  quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 1. Gather the basic quiz data
    const payload = {
      title: document.getElementById('quizTitle').value,
      module: document.getElementById('quizModule').value,
      type: document.getElementById('quizType').value,
      duration: document.getElementById('quizDuration').value,
      marks: document.getElementById('quizMarks').value,
      questions: []
    };

    // 2. Gather all the questions from the screen
    const questionDivs = document.querySelectorAll('.question');
    questionDivs.forEach((qDiv) => {
      const textInput = qDiv.querySelector('input[type="text"]');
      if (!textInput.value) return; // Skip if they didn't type a question

      const qType = qDiv.querySelector('h3').textContent.includes('Single') ? 'single' : 'multiple';
      const options = [];
      const correct_answers = [];

      // Look at the 5 options for this question
      const optionDivs = qDiv.querySelectorAll('.option');
      optionDivs.forEach((optDiv) => {
        const optText = optDiv.querySelector('input[type="text"]').value;
        const isChecked = optDiv.querySelector('input[type="radio"], input[type="checkbox"]').checked;
        
        if (optText) {
          options.push(optText);
          if (isChecked) correct_answers.push(optText); // Remember which ones they marked correct
        }
      });

      payload.questions.push({
        type: qType,
        text: textInput.value,
        options: options,
        correct_answers: correct_answers
      });
    });

    // 3. Send the massive payload to Python
    fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message); // Show success popup
      if(data.status === 'success') {
        quizForm.reset(); // Clear the form so they can make another quiz
        questionsContainer.innerHTML = ''; 
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error saving quiz. Check the console.');
    });
  });
});