let speakers;
const speakersDiv = document.getElementById('speakers');
const submitButton = document.getElementById('submitVote');

async function fetchSpeakers() {
    const response = await fetch(host + "/speakers", {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'bypass-tunnel-reminder': 'true'
        }
    });
    speakers = await response.json();

    // Display the speakers and their voting inputs
    speakers.speakers.forEach(speaker => {
        const speakerDiv = document.createElement('div');
        speakerDiv.classList.add('speaker');

        speakerDiv.innerHTML = `
            <h2>${speaker.name}</h2>
            <img src="${speaker.photo}" alt="${speaker.name}">
            <h3>${speaker.project}</h3>
            <label for="technical-${speaker.Id}">Technical: 
                <input type="number" id="technical-${speaker.Id}" name="technical" min="0" max="20" step="0.25">
            </label><br>
            <label for="non-technical-${speaker.Id}">Non-Technical: 
                <input type="number" id="non-technical-${speaker.Id}" name="non-technical" min="0" max="20" step="0.25">
            </label>
        `;

        speakersDiv.appendChild(speakerDiv);
    });

    submitButton.disabled = false;  // Enable the submit button once speakers are loaded
}

// Submit votes to the server
async function submitVotes(event) {
    event.preventDefault();

    // Create the votes object
    const votes = speakers.speakers.map(speaker => {
        return {
            Id: speaker.Id,
            "Bureau Votes": {
                "Technical": parseFloat(document.getElementById(`technical-${speaker.Id}`).value) || 0,
                "Non-Technical": parseFloat(document.getElementById(`non-technical-${speaker.Id}`).value) || 0,
            }
        };
    });

    // Send the votes to the backend
    const response = await fetch(host + '/bureau-vote', {
        method: 'POST',
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json',
            'bypass-tunnel-reminder' : 'true'
        },
        body: JSON.stringify({ votes })
    });

    if (response.ok) {
        alert("Votes submitted successfully!");
    } else {
        alert("Error submitting votes. Please try again.");
    }
}

// Attach the form submit event listener
document.getElementById('speakersForm').addEventListener('submit', submitVotes);

// Load speakers when the page is ready
document.addEventListener('DOMContentLoaded', fetchSpeakers);
