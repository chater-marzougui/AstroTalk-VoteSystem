let speakers;

const speakersID = document.getElementById('speakers');
const submitButton = document.getElementById('submitVote');
let selectedSpeaker = null;

const host = "https://95aa-196-203-181-122.ngrok-free.app";


async function fetchSpeakers() {
    const response = await fetch(host + "/speakers", {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    speakers = await response.json();
}


async function enterPresentation() {

    const response = await fetch(host + '/enter-presentation', {
        method: 'POST',
        headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
            'Content-Type': 'application/json',

          }),
        body: JSON.stringify({
            speaker: "Speaker 1"
        })
    });

    if (response.ok) {
        alert("Your vote has been submitted successfully!");
    } else {
        alert("Error submitting vote. Please try again.");
    }
}

enterPresentation();

async function submitVote() {
    if (!selectedSpeaker) {
        alert("Please select a speaker to vote for!");
        return;
    }

    const response = await fetch(host + ':5000/member-vote', {
        method: 'POST',
        headers: new Headers({
            "ngrok-skip-browser-warning": "69420",
            'Content-Type': 'application/json',

        }),
        body: JSON.stringify({
            speaker: selectedSpeaker
        })
    });

    if (response.ok) {
        alert("Your vote has been submitted successfully!");
    } else {
        alert("Error submitting vote. Please try again.");
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await fetchSpeakers();

    speakers.speakers.forEach(speaker => {
        const speakerDiv = document.createElement('div');
        speakerDiv.classList.add('speaker');
        speakerDiv.innerHTML = `
            <h2>${speaker.name}</h2>
            <img src="${speaker.photo}" alt="${speaker.name}">
            <h3>${speaker.project}</h3>
            <label>
                <input type="radio" name="vote" value="${speaker.Id}" />
                Vote for ${speaker.name}
            </label>
        `;
        speakersID.appendChild(speakerDiv);
    });

    document.querySelectorAll('input[name="vote"]').forEach(input => {
        input.addEventListener('change', (event) => {
            selectedSpeaker = event.target.value;
            submitButton.disabled = false;
        });
    });
    submitButton.addEventListener('click', submitVote);
});