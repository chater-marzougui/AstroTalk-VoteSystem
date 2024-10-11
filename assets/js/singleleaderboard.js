let speakers, lastSpeakers;
let speakersChart;
const entered = document.getElementById('entered');

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
    const enteredVoters = speakersData['entered'];
    let totalMembers = 0;
    
    speakersData.speakers.forEach(speaker => {
        totalMembers += speaker['Member Votes'];
    });
    entered.textContent =  `${totalMembers} / ${enteredVoters}`;

    speakersData.speakers.forEach(speaker => {
        labels.push(speaker.name);
        const bureauTotal = speaker['Bureau Votes']['Technical'] +
                            speaker['Bureau Votes']['Non-Technical'];
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

        // Custom plugin to display data labels on top of the bars
        const dataLabelsPlugin = {
            id: 'dataLabelsPlugin',
            afterDatasetsDraw(chart) {
                const {ctx, scales: {x, y}} = chart;
        
                chart.data.labels.forEach((label, index) => {
                    // Sum the values from both datasets for this index
                    const bureauVotes = chart.data.datasets[0].data[index];
                    const memberVotes = chart.data.datasets[1].data[index];
                    const totalValue = bureauVotes + memberVotes;
        
                    // Get the bar element for the topmost dataset (the second one in this case)
                    const meta1 = chart.getDatasetMeta(1);  // Meta for the second dataset (Member Votes)
                    const bar = meta1.data[index];
        
                    // Get position to place the text above the stacked bar
                    const xPosition = bar.x;
                    const yPosition = y.getPixelForValue(totalValue) - 5; // Adjust the yPosition to place the text above the total height of the stacked bars
        
                    // Draw the total value on top of the stacked bars
                    ctx.save();
                    ctx.fillStyle = 'white'; // Text color
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(totalValue.toFixed(2), xPosition, yPosition); // Display total value with 2 decimal places
                    ctx.restore();
                });
            }
        };
        

        speakersChart = new Chart(speakersChartCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Bureau Votes',
                        data: bureauVotes,
                        backgroundColor: 'rgba(153, 102, 255, 0.8)',
                    },
                    {
                        label: 'Member Votes',
                        data: memberVotes,
                        backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: 'white', // Color of the x-axis labels
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)', // Color of the x-axis grid lines
                        },
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        ticks: {
                            color: 'white', // Color of the y-axis labels
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)', // Color of the y-axis grid lines
                        },
                    }
                },
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Speakers Voting Comparison',
                        color: 'white', // Color of the title
                    },
                    legend: {
                        labels: {
                            color: 'white', // Color of the legend labels
                        },
                    },
                },
                backgroundColor: 'black' // Background color for the chart area
            },
            plugins: [dataLabelsPlugin] // Add the custom plugin here
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