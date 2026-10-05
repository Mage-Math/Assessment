if (isCorrect) {
  score++;
  masterSkills.add(currentQuestion.skill);
  
  // Correct answer: Increase difficulty (Cap at Level 3)
  if (currentDifficultyLevel < 3) currentDifficultyLevel++;
} else {
  lackingSkills.add(currentQuestion.skill);
  
  // Incorrect answer: Decrease difficulty (Floor at Level 1)
  if (currentDifficultyLevel > 1) currentDifficultyLevel--;
}
