let currentDifficultyLevel = 1; // Start all students at Level 1 (or Level 2 if preferred)

function submitAnswer() {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) {
        alert("Please select an answer.");
        return;
    }

    const selectedIndex = Number(selected.value);
    const chosenOpt = currentQuestion.shuffledOpts[selectedIndex];
    const isCorrect = chosenOpt.isCorrect;
    const correctAnswerText = currentQuestion.options[currentQuestion.answer];

    // Track answer history
    studentAnswersList.push({
        question: currentQuestion.question,
        skill: currentQuestion.skill,
        level: currentDifficultyLevel,
        selectedAnswer: chosenOpt.text,
        correctAnswer: correctAnswerText,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        score++;
        masterSkills.add(currentQuestion.skill);

        // Correct Answer -> Increase difficulty (Max Level 3)
        if (currentDifficultyLevel < 3) {
            currentDifficultyLevel++;
        }
    } else {
        lackingSkills.add(currentQuestion.skill);

        // Incorrect Answer -> Decrease difficulty (Min Level 1)
        if (currentDifficultyLevel > 1) {
            currentDifficultyLevel--;
        }
    }

    currentQuestionIndex++;
    showNextAdaptiveQuestion();
}

function showNextAdaptiveQuestion() {
    if (currentQuestionIndex >= 15) { // Stop after 15 adaptive questions or your chosen limit
        finishTest();
        return;
    }

    // Filter remaining questions matching current difficulty level
    let availableQuestions = questions.filter(q => 
        q.level === currentDifficultyLevel && 
        !studentAnswersList.some(ans => ans.question === q.question)
    );

    // Fallback if no unused questions left at this level
    if (availableQuestions.length === 0) {
        availableQuestions = questions.filter(q => 
            !studentAnswersList.some(ans => ans.question === q.question)
        );
    }

    if (availableQuestions.length === 0) {
        finishTest();
        return;
    }

    // Pick next question from matched pool
    currentQuestion = availableQuestions[0];
    document.getElementById("questionNumber").textContent = `${currentQuestionIndex + 1}`;

    let html = `<div class="question"><b>[Level ${currentDifficultyLevel}]</b> ${currentQuestion.question}</div>`;
    
    let opts = currentQuestion.options.map((opt, idx) => ({ text: opt, isCorrect: idx === currentQuestion.answer }));
    opts.sort(() => Math.random() - 0.5);
    currentQuestion.shuffledOpts = opts;

    opts.forEach((opt, index) => {
        html += `<label class="option"><input type="radio" name="answer" value="${index}"> ${opt.text}</label>`;
    });

    document.getElementById("questionArea").innerHTML = html;
}
