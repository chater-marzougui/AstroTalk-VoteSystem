let speakers, lastSpeakers;
let speakersChart;

async function fetchSpeakers() {
    const response = await fetch(host + "/speakers", {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'bypass-tunnel-reminder': 'true'
        }
    });
    speakers = await response.json();
}

async function updateSpeakersVisualization() {
    let speakersData = speakers;

    const labels = [];
    const bureauVotes = [];
    const memberVotes = [];
    let totalMembers = 0;

    speakersData.speakers.forEach(speaker => {
        totalMembers += speaker['Member Votes'];
    });

    speakersData.speakers.forEach(speaker => {
        labels.push(speaker.name);
        const bureauTotal = speaker['Bureau Votes']['Technical'] +
                            speaker['Bureau Votes']['Presentation'] +
                            speaker['Bureau Votes']['Posture'] +
                            speaker['Bureau Votes']['depth of knowledge'];
        const normalizedBureau = bureauTotal;
        const normalizedMembers = 60 / totalMembers * speaker['Member Votes'];

        bureauVotes.push(normalizedBureau);
        memberVotes.push(normalizedMembers);
    });

    if (speakersChart) {
        speakersChart.data.labels = labels;
        speakersChart.data.datasets[0].data = bureauVotes;  // Bureau Votes
        speakersChart.data.datasets[1].data = memberVotes;  // Member Votes
        speakersChart.update();  // This will animate the changes
    } else {
        const speakersChartCanvas = document.getElementById('speakersChart');
        const speakersChartCtx = speakersChartCanvas.getContext('2d');

        speakersChart = new Chart(speakersChartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Bureau Votes',
                        data: bureauVotes,
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    },
                    {
                        label: 'Member Votes',
                        data: memberVotes,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        min: 0,
                        max: 100,  
                    }
                },
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Speakers Voting Comparison',
                    }
                }
            }
        });
    }
}

setInterval(() => {
    fetchSpeakers().then(() => {
        if (JSON.stringify(speakers) === JSON.stringify(lastSpeakers)) {
            return;
        }
        updateSpeakersVisualization();
        lastSpeakers = speakers;
    });
}, 100);

fetchSpeakers().then(updateSpeakersVisualization);