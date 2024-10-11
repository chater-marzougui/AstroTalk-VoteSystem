const speakersID = document.getElementById('speakers');
const submitButton = document.getElementById('submitVote');
const welcomeScreen = document.getElementById('welcome-screen');
const loadingScreen = document.getElementById('loading-screen');
const timerContainerElement = document.getElementById('timer-container');
const timerElement = document.getElementById('timer');

let timeEnded = false;

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

function generateRandomString() {
    const astroTalkCookie = document.cookie.split(';').find(item => item.trim().startsWith('astroTalk='));

    if (astroTalkCookie) {
        return astroTalkCookie.trim().split('=')[1];
    }
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < 64; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    document.cookie = `astroTalk=${result}; max-age=172800; path=/;`;
    return result;
}


let selectedSpeaker = null;
let speakers;

async function fetchSpeakers() {
    const response = await fetch(host + "/speakers", {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'bypass-tunnel-reminder': 'true'
        }
    });
    speakers = await response.json();
}


async function showWelcomeMessage() {
    const welcomeMessage = document.getElementById("welcome-message");
    welcomeScreen.style.display = "flex";
    let charIndex = 0;
    const welcomemess = "Welcome to AstroTalk #2.0";
    function Wtype() {
        const displayedText = welcomemess.substring(0, charIndex++)

        welcomeMessage.textContent = displayedText;
        if (charIndex === welcomemess.length) {
            setTimeout(() => {
            welcomeScreen.style.display = "none";
            document.body.style.overflow = "auto";
                return;
        },1000);
        }
        setTimeout(Wtype, 150);
    }

    Wtype();
}

async function enterPresentation() {
    const randomString = generateRandomString();
    await fetch(host + '/enter-presentation', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",  // Ensure the Content-Type is set to application/json
            "ngrok-skip-browser-warning": "69420",
            "bypass-tunnel-reminder": "true",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            speaker: "Speaker 1",
            voter_id: randomString
        })
    });
}

enterPresentation();

async function submitVote() {
    submitButton.style.display = "none";
    if (!selectedSpeaker) {
        alert("Please select a speaker to vote for!");
        return;
    }

    const voter_id = generateRandomString();
    try {
        await fetch(host + '/member-vote', {
            method: 'POST',
            headers: new Headers({
                "ngrok-skip-browser-warning": "69420",
                'Content-Type': 'application/json',
                'bypass-tunnel-reminder': 'true'
    
            }),
            body: JSON.stringify({
                speaker: selectedSpeaker,
                voter_id: voter_id
            })
        });
        document.cookie = `voter_id=${selectedSpeaker}; max-age=172800; path=/;`;
        alert("Your vote has been submitted successfully!");
        submitButton.style.display = "none";
    } catch (error) {
        submitButton.style.display = "flex";
        alert("Error submitting vote. Please try again.");
    }

}

function startTimer(endTime) {
    const timerInterval = setInterval(() => {
        if (endTime < new Date().getTime()) {
            clearInterval(timerInterval);
            timerElement.textContent = "00:00";
            submitButton.disabled = true;
            timeEnded = true;
            submitButton.textContent = "Voting has ended";
            return;
        }
        const timeLeft = Math.floor((endTime - new Date().getTime()) / 1000);
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
    }, 1000); // Update every second
}

endTime = -1;

async function fetchSpeakersAndLoad() {
    x = false;
    while (!x) {
        try {
            enterPresentation();
            await fetchSpeakers();
            x = true;
        } catch (error) {
            console.log(error.message);
        }
    }

    endTime = speakers.endTime;
    console.log(endTime);
    if (endTime >= new Date().getTime()) {
        
        timerContainerElement.style.display = "flex";
        submitButton.style.display = "flex";
        startTimer(endTime);
    } else {
        timerContainerElement.style.display = "none";
        submitButton.style.display = "none";
    }

    speakers.speakers.forEach(speaker => {
        const speakerDiv = document.createElement('div');
        speakerDiv.classList.add('speaker');
        
        // Add an additional container for the photo to support the checkmark overlay
        speakerDiv.innerHTML = `
            <h2>${speaker.name}</h2>
            <div class="photo-container">
                <img class="speaker" src="${speaker.photo}" alt="${speaker.name}">
                <span class="check-icon" style="display: none;">&#x2714;</span> <!-- Hidden initially -->
            </div>
            <h3>${speaker.project}</h3>
            <label>
                <input type="radio" name="vote" value="${speaker.Id}" />
                <span class="custom-radio"></span>
                Vote for ${speaker.name}
            </label>
        `;
        speakersID.appendChild(speakerDiv);
    });
    
    loadingScreen.style.display = "none";
    // Check if the user has already voted
    
    const voter_id_cookie = document.cookie.split(';').find(item => item.trim().startsWith('voter_id='));
    let voter_id;
    if (voter_id_cookie) {
        voter_id = voter_id_cookie.trim().split('=')[1];
        
        const speakerDiv = document.querySelector(`input[value="${voter_id}"]`).closest('.speaker');
        if (speakerDiv) {
            const checkIcon = speakerDiv.querySelector('.check-icon');
            checkIcon.style.display = 'block'; // Show the check icon
        }
    }
    document.querySelectorAll('input[name="vote"]').forEach(input => {
        input.addEventListener('change', (event) => {
            // if the speaker want to change his vote he can do it
            selectedSpeaker = event.target.value;
            if (voter_id) {
                if (voter_id === event.target.value) {
                    submitButton.disabled = true;
                } else {
                    submitButton.disabled = !timeEnded;
                    submitButton.style.display = "flex";
                    submitButton.textContent = timeEnded ? "Change Vote" : "Time has ended";
                }
            } else {
                submitButton.disabled = false;
            }
        });
    });
    await showWelcomeMessage();
    
}

submitButton.addEventListener('click', submitVote);

fetchSpeakersAndLoad();