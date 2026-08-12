const button =
    document.getElementById("analyzeBtn");

const chatInput =
    document.getElementById("chatInput");

const result =
    document.getElementById("result");

const exampleBtn =
    document.getElementById("exampleBtn");

const clearBtn =
    document.getElementById("clearBtn");

const clearHistoryBtn =
    document.getElementById("clearHistoryBtn");


// =====================================================
// ANALYZE CONVERSATION
// =====================================================

button.addEventListener("click", async () => {

    const chat =
        chatInput.value.trim();


    // Check empty input
    if (!chat) {

        result.innerHTML = `
            <div class="error-message">
                ⚠️ Please paste a conversation first.
            </div>
        `;

        return;
    }


    // Disable button
    button.disabled = true;

    button.innerText =
        "⏳ Analyzing...";


    // Loading screen
    result.innerHTML = `
        <div class="loading">

            <div class="spinner"></div>

            <p>
                AI is analyzing the conversation...
            </p>

            <small>
                Looking for red flags, green flags and warning signs.
            </small>

        </div>
    `;


    try {

        const response =
            await fetch(
                "http://localhost:3000/analyze",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        chat: chat
                    })

                }
            );


        const data =
            await response.json();


        // Server error
        if (!response.ok) {

            throw new Error(
                data.error ||
                "Server error"
            );

        }


        // Display result
        displayResult(data);


        // Save history
        saveHistory(data);


        // Update dashboard
        updateDashboard();


    }

    catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        result.innerHTML = `

            <div class="error-message">

                ❌ Something went wrong.

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }


    // Re-enable button
    button.disabled = false;

    button.innerText =
        "🔍 Analyze Conversation";

});


// =====================================================
// DISPLAY RESULT
// =====================================================

function displayResult(data) {

    // ---------------------------------------------
    // SCORE
    // ---------------------------------------------

    const score =
        Math.max(
            0,
            Math.min(
                100,
                Number(data.score) || 0
            )
        );


    // ---------------------------------------------
    // SCORE CLASS
    // ---------------------------------------------

    let scoreClass =
        "low";


    if (score >= 75) {

        scoreClass =
            "extreme";

    }

    else if (score >= 50) {

        scoreClass =
            "high";

    }

    else if (score >= 25) {

        scoreClass =
            "moderate";

    }


    // ---------------------------------------------
    // FLAGS
    // ---------------------------------------------

    const redFlags =
        createList(
            data.redFlags,
            "🟢 No major red flags detected."
        );


    const yellowFlags =
        createList(
            data.yellowFlags,
            "🟢 No warning signs detected."
        );


    const greenFlags =
        createList(
            data.greenFlags,
            "No major positive signals detected."
        );


    // ---------------------------------------------
    // LEVEL
    // ---------------------------------------------

    const level =
        data.level ||
        "Unknown";


    // ---------------------------------------------
    // ANALYSIS
    // ---------------------------------------------

    const analysis =
        data.analysis ||
        "No analysis available.";


    // ---------------------------------------------
    // VERDICT
    // ---------------------------------------------

    const verdict =
        data.verdict ||
        "No overall verdict available.";


    // ---------------------------------------------
    // ADVICE
    // ---------------------------------------------

    const advice =
        data.advice ||
        "No advice available.";


    // =================================================
    // RESULT HTML
    // =================================================

    result.innerHTML = `

        <!-- SCORE -->

        <div class="score-section">


            <div class="score-container">

                <div
                    class="score-circle ${scoreClass}"
                >

                    <span id="scoreNumber">
                        0
                    </span>

                    <small>
                        /100
                    </small>

                </div>


                <div class="score-meter">

                    <div class="meter-track">

                        <div
                            class="meter-fill ${scoreClass}"
                            id="meterFill"
                        ></div>

                    </div>


                    <div class="meter-labels">

                        <span>
                            Safe
                        </span>

                        <span>
                            Moderate
                        </span>

                        <span>
                            Danger
                        </span>

                    </div>

                </div>

            </div>


            <div class="score-info">

                <h3>
                    ${escapeHTML(level)}
                    Risk
                </h3>

                <p>
                    Red Flag Score
                </p>

            </div>


        </div>


        <!-- ANALYSIS -->

        <div class="analysis-section">


            <!-- RED FLAGS -->

            <div class="analysis-box red">

                <h3>
                    🚩 Red Flags
                </h3>

                ${redFlags}

            </div>


            <!-- YELLOW FLAGS -->

            <div class="analysis-box yellow">

                <h3>
                    🟡 Yellow Flags
                </h3>

                ${yellowFlags}

            </div>


            <!-- GREEN FLAGS -->

            <div class="analysis-box green">

                <h3>
                    🟢 Green Flags
                </h3>

                ${greenFlags}

            </div>


            <!-- OVERALL ANALYSIS -->

            <div class="analysis-box">

                <h3>
                    🧠 Overall Analysis
                </h3>

                <p>
                    ${escapeHTML(
                        analysis
                    )}
                </p>

            </div>


            <!-- VERDICT -->

            <div class="analysis-box">

                <h3>
                    🎯 Overall Verdict
                </h3>

                <p>
                    ${escapeHTML(
                        verdict
                    )}
                </p>

            </div>


            <!-- ADVICE -->

            <div class="analysis-box advice">

                <h3>
                    💡 Advice
                </h3>

                <p>
                    ${escapeHTML(
                        advice
                    )}
                </p>

            </div>


        </div>

    `;


    // =================================================
    // ANIMATE SCORE
    // =================================================

    const scoreNumber =
        document.getElementById(
            "scoreNumber"
        );


    const meterFill =
        document.getElementById(
            "meterFill"
        );


    let currentScore =
        0;


    const animation =
        setInterval(() => {

            currentScore++;


            scoreNumber.textContent =
                currentScore;


            if (
                currentScore >= score
            ) {

                clearInterval(
                    animation
                );

            }

        }, 15);


    // Animate meter
    setTimeout(() => {

        meterFill.style.width =
            score + "%";

    }, 100);

}


// =====================================================
// CREATE LIST
// =====================================================

function createList(
    items,
    emptyMessage
) {

    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return `
            <p class="empty">
                ${emptyMessage}
            </p>
        `;

    }


    return `
        <ul>

            ${items.map(item => `

                <li>
                    ${escapeHTML(
                        String(item)
                    )}
                </li>

            `).join("")}

        </ul>
    `;

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// EXAMPLE CONVERSATION
// =====================================================

exampleBtn.addEventListener(
    "click",
    () => {

        chatInput.value =
`Them: Why didn't you reply?

You: I was studying.

Them: You always have an excuse.

You: I genuinely had work to do.

Them: If you actually cared about me, you would reply instantly.

You: I can't always be on my phone.

Them: Fine. I guess I'm just not important to you.

You: That's not what I said.

Them: Whatever. Don't talk to me then.`;


        chatInput.focus();

    }
);


// =====================================================
// CLEAR INPUT
// =====================================================

clearBtn.addEventListener(
    "click",
    () => {

        chatInput.value = "";


        result.innerHTML = `

            <p class="placeholder">
                Your analysis will appear here...
            </p>

        `;


        chatInput.focus();

    }
);


// =====================================================
// SAVE HISTORY
// =====================================================

function saveHistory(data) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "redFlagHistory"
            )
        ) || [];


    const entry = {

        score:
            Number(data.score) || 0,

        level:
            data.level ||
            "Unknown",

        redFlags:
            Array.isArray(
                data.redFlags
            )
                ? data.redFlags
                : [],

        yellowFlags:
            Array.isArray(
                data.yellowFlags
            )
                ? data.yellowFlags
                : [],

        greenFlags:
            Array.isArray(
                data.greenFlags
            )
                ? data.greenFlags
                : [],

        date:
            new Date()
                .toLocaleString()

    };


    // Put newest first
    history.unshift(
        entry
    );


    // Keep only last 10
    localStorage.setItem(

        "redFlagHistory",

        JSON.stringify(
            history.slice(0, 10)
        )

    );


    displayHistory();

}


// =====================================================
// DISPLAY HISTORY
// =====================================================

function displayHistory() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "redFlagHistory"
            )
        ) || [];


    const historyContainer =
        document.getElementById(
            "historyList"
        );


    if (!historyContainer) {

        return;

    }


    // No history
    if (history.length === 0) {

        historyContainer.innerHTML = `

            <p class="history-empty">
                No previous analyses yet.
            </p>

        `;

        return;

    }


    historyContainer.innerHTML =

        history.map(
            (item, index) => {


                let levelClass =
                    "low";


                if (
                    item.score >= 75
                ) {

                    levelClass =
                        "extreme";

                }

                else if (
                    item.score >= 50
                ) {

                    levelClass =
                        "high";

                }

                else if (
                    item.score >= 25
                ) {

                    levelClass =
                        "moderate";

                }


                return `

                    <div
                        class="history-item"
                    >

                        <div>

                            <strong>
                                🚩 Analysis #${
                                    history.length -
                                    index
                                }
                            </strong>

                            <small>
                                ${
                                    escapeHTML(
                                        item.date
                                    )
                                }
                            </small>

                        </div>


                        <div
                            class="
                                history-score
                                ${levelClass}
                            "
                        >

                            ${item.score}/100

                            <span>
                                ${
                                    escapeHTML(
                                        item.level
                                    )
                                }
                            </span>

                        </div>

                    </div>

                `;

            }

        ).join("");

}


// =====================================================
// UPDATE DASHBOARD
// =====================================================

function updateDashboard() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "redFlagHistory"
            )
        ) || [];


    const total =
        history.length;


    const totalElement =
        document.getElementById(
            "totalAnalyses"
        );


    const averageElement =
        document.getElementById(
            "averageScore"
        );


    const highestElement =
        document.getElementById(
            "highestScore"
        );


    const lowestElement =
        document.getElementById(
            "lowestScore"
        );


    const highRiskElement =
        document.getElementById(
            "highRiskCount"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    // No history
    if (total === 0) {

        if (averageElement) {

            averageElement.textContent =
                "0";

        }


        if (highestElement) {

            highestElement.textContent =
                "0";

        }


        if (lowestElement) {

            lowestElement.textContent =
                "0";

        }


        if (highRiskElement) {

            highRiskElement.textContent =
                "0";

        }


        drawChart([]);

        return;

    }


    // Get scores
    const scores =
        history.map(
            item =>
                Number(item.score) || 0
        );


    // Average
    const average =
        Math.round(
            scores.reduce(
                (a, b) =>
                    a + b,
                0
            ) / total
        );


    // Highest
    const highest =
        Math.max(
            ...scores
        );


    // Lowest
    const lowest =
        Math.min(
            ...scores
        );


    // High risk
    const highRisk =
        scores.filter(
            score =>
                score >= 50
        ).length;


    if (averageElement) {

        averageElement.textContent =
            average;

    }


    if (highestElement) {

        highestElement.textContent =
            highest;

    }


    if (lowestElement) {

        lowestElement.textContent =
            lowest;

    }


    if (highRiskElement) {

        highRiskElement.textContent =
            highRisk;

    }


    // Draw chart
    drawChart(
        history
            .slice()
            .reverse()
    );

}


// =====================================================
// DRAW CHART
// =====================================================

function drawChart(history) {

    const chartArea =
        document.getElementById(
            "chartArea"
        );


    const empty =
        document.getElementById(
            "chartEmpty"
        );


    if (
        !chartArea ||
        !empty
    ) {

        return;

    }


    // No data
    if (!history.length) {

        empty.style.display =
            "flex";


        chartArea
            .querySelectorAll(
                ".chart-bar"
            )
            .forEach(
                bar =>
                    bar.remove()
            );


        return;

    }


    empty.style.display =
        "none";


    // Remove old bars
    chartArea
        .querySelectorAll(
            ".chart-bar"
        )
        .forEach(
            bar =>
                bar.remove()
        );


    // Create bars
    history.forEach(
        item => {

            const bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "chart-bar";


            bar.style.height =
                "0%";


            bar.innerHTML = `

                <span>
                    ${Number(item.score) || 0}
                </span>

            `;


            chartArea.appendChild(
                bar
            );


            // Animate
            setTimeout(() => {

                bar.style.height =
                    (
                        Number(item.score) ||
                        0
                    ) + "%";

            }, 100);

        }
    );

}


// =====================================================
// CLEAR HISTORY
// =====================================================

clearHistoryBtn.addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "Are you sure you want to delete your analysis history?"
            );


        if (!confirmed) {

            return;

        }


        localStorage.removeItem(
            "redFlagHistory"
        );


        displayHistory();

        updateDashboard();

    }
);


// =====================================================
// LOAD SAVED DATA
// =====================================================

displayHistory();

updateDashboard();// =====================================================
// COPY RESULT
// =====================================================

const copyResultBtn =
    document.getElementById("copyResultBtn");


if (copyResultBtn) {

    copyResultBtn.addEventListener(
        "click",
        async () => {

            const resultText =
                result.innerText.trim();


            if (
                !resultText ||
                resultText.includes(
                    "Your analysis will appear here"
                )
            ) {

                alert(
                    "⚠️ Analyze a conversation first."
                );

                return;
            }


            try {

                await navigator.clipboard.writeText(
                    resultText
                );


                copyResultBtn.innerText =
                    "✅ Copied!";


                setTimeout(() => {

                    copyResultBtn.innerText =
                        "📋 Copy Result";

                }, 2000);


            } catch (error) {

                console.error(error);

                alert(
                    "❌ Could not copy the result."
                );

            }

        }
    );

}