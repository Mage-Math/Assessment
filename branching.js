const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7MAqukTjRKyzbzS4KiiiEbMCubFTYgOGZNmrTFFo8CD-CJtuLZv0qzJ9uGhDKQg/exec";
const TEACHER_PIN = "egam@2026";

const TIME_LIMIT_SECONDS = 45 * 60;
const MAX_TAB_SWITCHES = 3;

let studentName = "";
let currentQuestion = null;
let score = 0;
let currentLevel = 2; // Starts at Level 2
let highestLevelAchieved = 2;

let masterSkills = new Set();
let lackingSkills = new Set();
let studentAnswersList = [];
let usedQuestionIndices = new Set();

let timerInterval = null;
let timeRemaining = TIME_LIMIT_SECONDS;

let tabSwitchCount = 0;
let isTestActive = false;

/* EXPANDED MATH TEACHER QUESTION BANK (LEVELS 1 - 5) */
const questions = [
    // ==========================================
    // LEVEL 1: FOUNDATION (Middle School)
    // ==========================================
    { level: 1, skill: "Operations with Integers", question: "What is the value of -7 + 12 - 5?", options: ["0", "-10", "10", "14"], answer: 0 },
    { level: 1, skill: "Operations with Decimals", question: "Calculate 14.35 + 8.72 - 3.07.", options: ["20.00", "19.97", "18.97", "20.07"], answer: 0 },
    { level: 1, skill: "Operations with Fractions", question: "What is 3/4 + 2/5 in simplest form?", options: ["23/20", "5/9", "1/2", "11/20"], answer: 0 },
    { level: 1, skill: "Basic Proportions", question: "If 4 notebooks cost $12, how much will 9 notebooks cost?", options: ["$27", "$24", "$36", "$30"], answer: 0 },
    { level: 1, skill: "Basic Linear Equations", question: "Solve for x: 3x - 7 = 14", options: ["x = 7", "x = 6", "x = 8", "x = 5"], answer: 0 },
    { level: 1, skill: "Percentages", question: "What is 15% of 160?", options: ["24", "20", "18", "30"], answer: 0 },
    { level: 1, skill: "Perimeter & Area", question: "What is the perimeter of a rectangle with length 14 cm and width 6 cm?", options: ["40 cm", "84 cm²", "20 cm", "28 cm"], answer: 0 },
    { level: 1, skill: "Basic Probability", question: "A bag contains 4 red marbles and 6 blue marbles. What is the probability of picking a red marble?", options: ["2/5", "3/5", "4/6", "1/2"], answer: 0 },
    { level: 1, skill: "Order of Operations", question: "Evaluate: 18 - 3 × (4 + 2) ÷ 2", options: ["9", "45", "15", "12"], answer: 0 },

    // ==========================================
    // LEVEL 2: INTERMEDIATE (Pre-Algebra / Algebra 1)
    // ==========================================
    { level: 2, skill: "Solving Multi-Step Linear Equations", question: "Solve for x:\n4(x - 3) = 2x + 10", options: ["x = 11", "x = 7", "x = 5", "x = 13"], answer: 0 },
    { level: 2, skill: "Pythagoras Theorem", question: "A right triangle has legs measuring 9 cm and 12 cm. How long is the hypotenuse?", options: ["15 cm", "18 cm", "21 cm", "13 cm"], answer: 0 },
    { level: 2, skill: "Linear Inequalities", question: "Solve the inequality: -3x + 7 < 22", options: ["x > -5", "x < -5", "x > 5", "x < 5"], answer: 0 },
    { level: 2, skill: "Index Laws", question: "Simplify: (2³ × 2⁴) ÷ 2²", options: ["2⁵", "2⁶", "2⁷", "4⁵"], answer: 0 },
    { level: 2, skill: "Arithmetic Sequences", question: "Look at this sequence: 5, 9, 13, 17... What is the 15th term?", options: ["61", "57", "65", "53"], answer: 0 },
    { level: 2, skill: "Coordinate Geometry (Slope)", question: "What is the gradient (slope) of the line passing through (2, 5) and (6, 17)?", options: ["3", "4", "2.5", "12"], answer: 0 },
    { level: 2, skill: "Single-Bracket Factorization", question: "Factorize completely: 14x²y - 21xy²", options: ["7xy(2x - 3y)", "7x(2xy - 3y)", "xy(14x - 21y)", "14xy(x - y)"], answer: 0 },
    { level: 2, skill: "Polygon Angles", question: "What is the sum of the interior angles of a regular octagon (8-sided polygon)?", options: ["1080°", "1440°", "720°", "900°"], answer: 0 },
    { level: 2, skill: "Mean & Statistics", question: "The test scores of four students are 78, 85, 92, and 81. What score must a fifth student get to achieve an average of 85?", options: ["89", "85", "90", "94"], answer: 0 },

    // ==========================================
    // LEVEL 3: STANDARD HIGH SCHOOL (Geometry / Algebra 2)
    // ==========================================
    { level: 3, skill: "Systems of Linear Equations", question: "Solve the system:\n2x + 3y = 12\nx + y = 5", options: ["x = 3, y = 2", "x = 2, y = 3", "x = 4, y = 1", "x = 5, y = 0"], answer: 0 },
    { level: 3, skill: "Quadratic Factorisation", question: "Factorise x² - 7x + 12 completely.", options: ["(x - 3)(x - 4)", "(x + 3)(x + 4)", "(x - 2)(x - 6)", "(x + 1)(x - 12)"], answer: 0 },
    { level: 3, skill: "Literal Equations", question: "In A = P(1 + rt), solve for 'r'.", options: ["r = (A - P) / (Pt)", "r = (A + P) / Pt", "r = A / Pt - 1", "r = (A - 1) / Pt"], answer: 0 },
    { level: 3, skill: "Compound Interest", question: "Deposit $1,000 at 5% annual compound interest. How much total balance is present after 2 years?", options: ["$1,102.50", "$1,100.00", "$1,050.00", "$1,125.00"], answer: 0 },
    { level: 3, skill: "Trigonometric Ratios", question: "In a right triangle, opposite side = 8 cm, hypotenuse = 10 cm. Find sin(θ).", options: ["0.8", "0.6", "1.25", "0.75"], answer: 0 },
    { level: 3, skill: "Quadratic Equations", question: "Solve for x in the quadratic equation: x² - 5x - 14 = 0", options: ["x = 7, x = -2", "x = -7, x = 2", "x = 14, x = -1", "x = -5, x = 2"], answer: 0 },
    { level: 3, skill: "Volume of 3D Shapes", question: "A cylinder has a base radius of 3 cm and height of 10 cm. Find its volume in terms of π.", options: ["90π cm³", "30π cm³", "60π cm³", "180π cm³"], answer: 0 },
    { level: 3, skill: "Scientific Notation", question: "Write 0.0000456 in standard scientific notation.", options: ["4.56 × 10⁻⁵", "4.56 × 10⁻⁴", "45.6 × 10⁻⁶", "0.456 × 10⁻⁴"], answer: 0 },
    { level: 3, skill: "Radicals & Exponents", question: "Simplify the radical expression: √72 + √18", options: ["9√2", "6√2", "12√2", "8√2"], answer: 0 },

    // ==========================================
    // LEVEL 4: ADVANCED HIGH SCHOOL (Pre-Calculus / Trigonometry)
    // ==========================================
    { level: 4, skill: "Quadratic Formula & Discriminant", question: "Find the roots of 2x² - 4x - 3 = 0 using the quadratic formula.", options: ["(2 ± √10) / 2", "(4 ± √10) / 2", "(2 ± √5) / 2", "(1 ± √10) / 2"], answer: 0 },
    { level: 4, skill: "Logarithms", question: "Solve for x: log₂(x) + log₂(x - 2) = 3", options: ["x = 4", "x = 2", "x = 8", "x = 3"], answer: 0 },
    { level: 4, skill: "Functions & Composition", question: "If f(x) = x² - 3 and g(x) = 2x + 1, what is f(g(3))?", options: ["46", "32", "22", "16"], answer: 0 },
    { level: 4, skill: "Polynomial Division", question: "Find the remainder when x³ - 3x² + 5x - 7 is divided by (x - 2).", options: ["-1", "3", "5", "-3"], answer: 0 },
    { level: 4, skill: "Geometric Series", question: "Find the sum to infinity of the infinite geometric series: 12 + 4 + 4/3 + 4/9 + ...", options: ["18", "16", "24", "20"], answer: 0 },
    { level: 4, skill: "Complex Numbers", question: "Evaluate (3 + 4i)(2 - i) in standard a + bi form.", options: ["10 + 5i", "10 + 11i", "2 + 5i", "14 + 5i"], answer: 0 },
    { level: 4, skill: "Trigonometric Identities", question: "Simplify the expression: (1 - sin²θ) / cos(θ)", options: ["cos(θ)", "sin(θ)", "tan(θ)", "sec(θ)"], answer: 0 },
    { level: 4, skill: "Exponential Growth", question: "A population doubles every 4 years. If the initial population is 500, what is the population after 12 years?", options: ["4,000", "2,000", "6,000", "8,000"], answer: 0 },
    { level: 4, skill: "Vector Operations", question: "Find the dot product of vectors u = ⟨3, -2⟩ and v = ⟨4, 5⟩.", options: ["2", "22", "-2", "14"], answer: 0 },

    // ==========================================
    // LEVEL 5: MASTERY / OLYMPIAD (Calculus / Linear Algebra)
    // ==========================================
    { level: 5, skill: "Calculus (Derivatives)", question: "What is the derivative of f(x) = x³ · e²ˣ with respect to x?", options: ["e²ˣ (3x² + 2x³)", "6x² e²ˣ", "3x² e²ˣ", "2x³ e²ˣ"], answer: 0 },
    { level: 5, skill: "Calculus (Integration)", question: "Evaluate the definite integral: ∫₀² (3x² - 2x + 1) dx.", options: ["6", "4", "8", "10"], answer: 0 },
    { level: 5, skill: "Complex Numbers (De Moivre)", question: "What is the polar/rectangular form of (1 + i)⁶?", options: ["-8i", "8i", "-8", "8"], answer: 0 },
    { level: 5, skill: "Combinatorics & Permutations", question: "How many distinct arrangements can be formed from the letters in 'PARALLEL'?", options: ["3,360", "6,720", "40,320", "1,680"], answer: 0 },
    { level: 5, skill: "Matrix Determinants", question: "What is the determinant of the 3x3 matrix:\n| 2  0  1 |\n| 1  3  0 |\n| 0  2  4 |", options: ["26", "20", "18", "24"], answer: 0 },
    { level: 5, skill: "Differential Equations", question: "Solve the differential equation dy/dx = 3x²y given y(0) = 2.", options: ["y = 2e^(x³)", "y = e^(x³) + 1", "y = 2e^(3x)", "y = 6e^(x²)"], answer: 0 },
    { level: 5, skill: "Calculus (Implicit Differentiation)", question: "Find dy/dx for x² + y² = 25 at the point (3, 4).", options: ["-3/4", "3/4", "-4/3", "4/3"], answer: 0 },
    { level: 5, skill: "Limits & L'Hôpital's Rule", question: "Evaluate the limit: lim (x → 0) [sin(5x) / x].", options: ["5", "1", "0", "Undefined"], answer: 0 },
    { level: 5, skill: "Vector Cross Product", question: "Find the magnitude of the cross product of u = ⟨1, 0, 0⟩ and v = ⟨0, 2, 0⟩.", options: ["2", "0", "1", "4"], answer: 0 }
];

/* SECURITY & TAB SWITCH DETECTION */
document.addEventListener("visibilitychange", handleTabSwitch);

function handleTabSwitch() {
    if (document.hidden && isTestActive) {
        tabSwitchCount++;
        document.getElementById("tabWarning").classList.remove("hidden");
        document.getElementById("switchCountDisplay").textContent = tabSwitchCount;

        if (tabSwitchCount > MAX_TAB_SWITCHES) {
            alert(`Violation threshold exceeded! Switching tabs is strictly prohibited. Your assessment has been automatically canceled and submitted.`);
            document.getElementById("autoSubmitReason").textContent = "Note: Assessment was automatically submitted due to a violation of the tab switch policy.";
            finishTest();
        } else {
            alert(`WARNING: Switching tabs is strictly prohibited! Violation ${tabSwitchCount} recorded. Exceeding 3 violations will immediately cancel your exam.`);
        }
    }
}

/* TIMER LOGIC */
function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        let mins = Math.floor(timeRemaining / 60);
        let secs = timeRemaining % 60;
        document.getElementById("timeDisplay").textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            finishTest();
        }
    }, 1000);
}

/* ASSESSMENT EXECUTION */
function startTest() {
    studentName = document.getElementById("studentName").value.trim();
    if (!studentName) {
        alert("Please enter student name.");
        return;
    }

    score = 0;
    currentLevel = 2;
    highestLevelAchieved = 2;
    tabSwitchCount = 0;
    isTestActive = true;
    masterSkills.clear();
    lackingSkills.clear();
    studentAnswersList = [];
    usedQuestionIndices.clear();

    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("testScreen").classList.remove("hidden");
    startTimer();
    showNextQuestion();
}

function showNextQuestion() {
    let candidateIndices = [];
    questions.forEach((q, idx) => {
        if (q.level === currentLevel && !usedQuestionIndices.has(idx)) {
            candidateIndices.push(idx);
        }
    });

    if (candidateIndices.length === 0) {
        questions.forEach((q, idx) => {
            if (!usedQuestionIndices.has(idx)) {
                candidateIndices.push(idx);
            }
        });
    }

    if (candidateIndices.length === 0) {
        finishTest();
        return;
    }

    let chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    usedQuestionIndices.add(chosenIndex);
    currentQuestion = questions[chosenIndex];

    document.getElementById("questionNumber").textContent = `${studentAnswersList.length + 1}`;

    let html = `<div class="question">${currentQuestion.question}</div>`;
    
    let opts = currentQuestion.options.map((opt, idx) => ({ text: opt, isCorrect: idx === currentQuestion.answer }));
    opts.sort(() => Math.random() - 0.5);
    currentQuestion.shuffledOpts = opts;

    opts.forEach((opt, index) => {
        html += `<label class="option"><input type="radio" name="answer" value="${index}"> ${opt.text}</label>`;
    });

    document.getElementById("questionArea").innerHTML = html;
}

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

    studentAnswersList.push({
        question: currentQuestion.question,
        skill: currentQuestion.skill,
        level: currentQuestion.level,
        selectedAnswer: chosenOpt.text,
        correctAnswer: correctAnswerText,
        isCorrect: isCorrect
    });

    if (isCorrect) {
        score++;
        masterSkills.add(currentQuestion.skill);
        if (currentLevel < 5) currentLevel++;
        if (currentLevel > highestLevelAchieved) highestLevelAchieved = currentLevel;
    } else {
        lackingSkills.add(currentQuestion.skill);
        if (currentLevel > 1) currentLevel--;
    }

    showNextQuestion();
}

function finishTest() {
    if (!isTestActive && document.getElementById("testScreen").classList.contains("hidden")) return;
    
    isTestActive = false;
    clearInterval(timerInterval);
    document.getElementById("testScreen").classList.add("hidden");
    document.getElementById("resultScreen").classList.remove("hidden");

    let totalQuestions = studentAnswersList.length || 1;
    let percentage = Math.round((score / totalQuestions) * 100);
    let targetGrade = "";

    if (highestLevelAchieved >= 4 && percentage >= 70) {
        targetGrade = "Grade 9 (Advanced Track)";
    } else if (highestLevelAchieved >= 3 && percentage >= 55) {
        targetGrade = "Grade 8 (Standard Track)";
    } else {
        targetGrade = "Grade 7 (Foundation Track)";
    }

    document.getElementById("displayStudentName").textContent = studentName;

    let existing = JSON.parse(localStorage.getItem("mage_diagnostic_results") || "[]");
    existing.push({
        name: studentName,
        score: score,
        total: totalQuestions,
        percentage: percentage,
        placement: targetGrade,
        tabSwitches: tabSwitchCount,
        date: new Date().toLocaleDateString(),
        details: studentAnswersList
    });
    localStorage.setItem("mage_diagnostic_results", JSON.stringify(existing));

    sendToGoogleSheets(percentage, targetGrade, totalQuestions);
}

function sendToGoogleSheets(percentage, placement, total) {
    document.getElementById("savingMessage").textContent = "Saving responses...";
    const data = {
        name: studentName,
        score: score,
        total: total,
        percentage: percentage,
        placement: placement,
        tabSwitches: tabSwitchCount,
        date: new Date().toLocaleString(),
        details: studentAnswersList
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
    })
    .then(() => {
        document.getElementById("savingMessage").textContent = "Assessment submitted successfully!";
    })
    .catch(() => {
        document.getElementById("savingMessage").textContent = "Assessment recorded locally.";
    });
}

/* TEACHER DASHBOARD LOGIC */
function openTeacherLogin() {
    let pin = prompt("Enter Security Passcode to access Teacher Dashboard:");
    if (pin === TEACHER_PIN) {
        document.getElementById("startScreen").classList.add("hidden");
        document.getElementById("resultScreen").classList.add("hidden");
        document.getElementById("teacherScreen").classList.remove("hidden");
        loadTeacherDashboard();
    } else if (pin !== null) {
        alert("Incorrect Passcode. Access Denied.");
    }
}

function exitTeacherPortal() {
    document.getElementById("teacherScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
}

function loadTeacherDashboard() {
    let records = JSON.parse(localStorage.getItem("mage_diagnostic_results") || "[]");
    let tbody = document.getElementById("teacherTableBody");
    tbody.innerHTML = "";

    if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">No student submissions recorded yet.</td></tr>`;
        return;
    }

    records.forEach((r, index) => {
        let switchBadge = r.tabSwitches > 0 ? `<span style="color:red; font-weight:bold;">${r.tabSwitches}</span>` : "0";
        tbody.innerHTML += `
            <tr>
                <td><b>${r.name}</b></td>
                <td>${r.score} / ${r.total}</td>
                <td>${r.percentage}%</td>
                <td>${r.placement}</td>
                <td>${switchBadge}</td>
                <td>${r.date}</td>
                <td><button class="btn-secondary" style="padding: 5px 10px; border-radius: 4px; border:none; cursor:pointer; color:white;" onclick="viewStudentDetails(${index})">View Breakdown</button></td>
            </tr>
        `;
    });
}

function viewStudentDetails(index) {
    let records = JSON.parse(localStorage.getItem("mage_diagnostic_results") || "[]");
    let student = records[index];
    if (!student) return;

    document.getElementById("modalStudentName").textContent = student.name;
    document.getElementById("modalMeta").textContent = `Score: ${student.score}/${student.total} (${student.percentage}%) | Placement: ${student.placement} | Tab Switches: ${student.tabSwitches || 0} | Date: ${student.date}`;

    let html = "";
    if (student.details && student.details.length > 0) {
        student.details.forEach((item, i) => {
            let statusClass = item.isCorrect ? "status-correct" : "status-incorrect";
            let statusText = item.isCorrect ? "✓ Correct" : "✗ Incorrect";

            html += `
                <div class="detail-card">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <b>Q${i + 1} (Level ${item.level || 1}): ${item.skill}</b>
                        <span class="${statusClass}">${statusText}</span>
                    </div>
                    <div style="font-size:14px; color:#444; margin-bottom:8px;">${item.question}</div>
                    <div style="font-size:13px;"><b>Selected Answer:</b> ${item.selectedAnswer}</div>
                    <div style="font-size:13px;"><b>Correct Answer:</b> ${item.correctAnswer}</div>
                </div>
            `;
        });
    } else {
        html = "<p>No detailed item analysis available for this entry.</p>";
    }

    document.getElementById("modalDetailsArea").innerHTML = html;
    document.getElementById("detailModal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("detailModal").classList.add("hidden");
}

function exportClassCSV() {
    let records = JSON.parse(localStorage.getItem("mage_diagnostic_results") || "[]");
    if (records.length === 0) {
        alert("No results available to export.");
        return;
    }

    let csv = "Student Name,Score,Total,Percentage,Placement,Tab Switches,Date,Question Number,Skill,Question Text,Student Answer,Correct Answer,Status\n";
    records.forEach(r => {
        if (r.details && r.details.length > 0) {
            r.details.forEach((d, idx) => {
                let status = d.isCorrect ? "Correct" : "Incorrect";
                csv += `"${r.name.replace(/"/g, '""')}",${r.score},${r.total},${r.percentage}%,"${r.placement}",${r.tabSwitches || 0},"${r.date}",${idx + 1},"${d.skill.replace(/"/g, '""')}","${d.question.replace(/"/g, '""')}","${d.selectedAnswer.replace(/"/g, '""')}","${d.correctAnswer.replace(/"/g, '""')}","${status}"\n`;
            });
        } else {
            csv += `"${r.name.replace(/"/g, '""')}",${r.score},${r.total},${r.percentage}%,"${r.placement}",${r.tabSwitches || 0},"${r.date}",N/A,N/A,N/A,N/A,N/A,N/A\n`;
        }
    });

    let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "MAGE_Detailed_Class_Results.csv";
    link.click();
}

function clearClassData() {
    if (confirm("Are you sure you want to delete all saved student results?")) {
        localStorage.removeItem("mage_diagnostic_results");
        loadTeacherDashboard();
    }
}
