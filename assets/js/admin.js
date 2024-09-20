const speakerForm = document.getElementById('speakerForm');
const speakersList = document.getElementById('speakers');
const submitButton = document.getElementById('submitVote');
let selectedSpeaker = null;

const host = 'https://95aa-196-203-181-122.ngrok-free.app';

document.addEventListener('DOMContentLoaded', () => {
    
    // Handle form submission for adding a new speaker
    speakerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const photo = document.getElementById('photo').value;
        const project = document.getElementById('project').value;

        const newSpeaker = { name, photo, project };

        fetch(host + '/add-speaker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': '455'
            },
            body: JSON.stringify(newSpeaker)
        })
        .then(response => response.json())
        .then(data => {
            updateSpeakers();
            speakerForm.reset();  // Reset the form after successful submission
        })
        .catch(error => console.error('Error:', error));
    });

    updateSpeakers();
});

// Function to delete a speaker
function deleteSpeaker() {
    if (!selectedSpeaker) return; // Ensure a speaker is selected

    fetch(host + `/delete-speaker/${selectedSpeaker}`, { // Use the ID in the URL
        method: 'DELETE',
        headers: {
            'ngrok-skip-browser-warning': '455'
        }
    })
    .then(response => {
        if (response.ok) {
            updateSpeakers(); // Update the list after successful deletion
        } else {
            console.error('Failed to delete speaker');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to fetch the speakers list
async function fetchSpeakers() {
    const response = await fetch(host + "/speakers", {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    });
    return await response.json(); // Return the parsed JSON
}

// Function to update the displayed speakers list
async function updateSpeakers() {
    const speakersData = await fetchSpeakers(); // Fetch the speakers list
    const speakersList = document.getElementById('speakers');
    speakersList.innerHTML = ''; // Clear previous list

    // Reset selected speaker and disable the submit button
    selectedSpeaker = null;
    submitButton.disabled = true;

    speakersData.speakers.forEach(speaker => {
        const speakerDiv = document.createElement('div');
        speakerDiv.classList.add('speaker');
        speakerDiv.innerHTML = `
            <h2>${speaker.name}</h2>
            <img src="${speaker.photo}" alt="${speaker.name}">
            <h3>${speaker.project}</h3>
            <label>
                <input type="radio" name="vote" value="${speaker.Id}" />
                Delete ${speaker.name}
            </label>
        `;
        speakersList.appendChild(speakerDiv);
    });

    // Add event listeners to the radio buttons after rendering
    document.querySelectorAll('input[name="vote"]').forEach(input => {
        input.addEventListener('change', (event) => {
            selectedSpeaker = event.target.value; // Set selected speaker ID
            submitButton.disabled = false; // Enable delete button
        });
    });
}

// Attach delete button functionality
submitButton.addEventListener('click', deleteSpeaker);

// Update speakers on page load
window.onload = updateSpeakers;
