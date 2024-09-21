let speakers;
const speakersDiv = document.getElementById('speakers');
const submitButton = document.getElementById('submitVote');
const host = "http://localhost:5000"; // Update this with your backend's URL

// Fetch speakers from the server
async function fetchSpeakers() {
    const response = await fetch(host + "/speakers", {
        headers: {
            'ngrok-skip-browser-warning': 'true'
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
                <input type="number" id="technical-${speaker.Id}" name="technical" min="0" max="10" step="0.1">
            </label><br>
            <label for="presentation-${speaker.Id}">Presentation: 
                <input type="number" id="presentation-${speaker.Id}" name="presentation" min="0" max="10" step="0.1">
            </label><br>
            <label for="posture-${speaker.Id}">Posture: 
                <input type="number" id="posture-${speaker.Id}" name="posture" min="0" max="10" step="0.1">
            </label><br>
            <label for="knowledge-${speaker.Id}">Depth of Knowledge: 
                <input type="number" id="knowledge-${speaker.Id}" name="knowledge" min="0" max="10" step="0.1">
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
                "Presentation": parseFloat(document.getElementById(`presentation-${speaker.Id}`).value) || 0,
                "Posture": parseFloat(document.getElementById(`posture-${speaker.Id}`).value) || 0,
                "depth of knowledge": parseFloat(document.getElementById(`knowledge-${speaker.Id}`).value) || 0
            }
        };
    });

    // Send the votes to the backend
    const response = await fetch(host + '/bureau-vote', {
        method: 'POST',
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json'
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
