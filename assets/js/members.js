const speakersID = document.getElementById('speakers');
const submitButton = document.getElementById('submitVote');
const welcomeScreen = document.getElementById('welcome-screen');
const loadingScreen = document.getElementById('loading-screen');

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
            "bypass-tunnel-reminder": "true"
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

    console.log("Selected speaker:", selectedSpeaker);
    const voter_id = generateRandomString();
    const response = await fetch(host + '/member-vote', {
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

    if (response.ok) {
        alert("Your vote has been submitted successfully!");
    } else {
        submitButton.style.display = "flex";
        alert("Error submitting vote. Please try again.");
    }
}

async function fetchSpeakersAndLoad() {
    x = false;
    while (!x) {
        try {
            enterPresentation();
            await fetchSpeakers();
            x = true;
        } catch (error) {
            console.log(error);
        }
    }

    speakers.speakers.forEach(speaker => {
        const speakerDiv = document.createElement('div');
        speakerDiv.classList.add('speaker');
        speakerDiv.innerHTML = `
            <h2>${speaker.name}</h2>
            <img src="${speaker.photo}" alt="${speaker.name}">
            <h3>${speaker.project}</h3>
            <label>
                <input type="radio" name="vote" value="${speaker.Id}" />
                <span class="custom-radio"></span>
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

    loadingScreen.style.display = "none";
    await showWelcomeMessage();

}

submitButton.addEventListener('click', submitVote);

fetchSpeakersAndLoad();