const speakersID = document.getElementById('speakers');
const submitButton = document.getElementById('submitVote');
const welcomeScreen = document.getElementById('welcome-screen');
const loadingScreen = document.getElementById('loading-screen');
const timerContainerElement = document.getElementById('timer-container');
const timerElement = document.getElementById('timer');
const welcomeMessage = document.getElementById("welcome-message");


const socket = io(host, {
    transports: ['websocket']
});

let timeEnded = true;
let endTime;
let isTimerRunning = false;
let selectedSpeaker = null;
let speakers;
const voter_id = generateRandomString();

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


async function fetchSpeakers() {
    const response = await fetch(host + "/speakers", {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'bypass-tunnel-reminder': 'true'
        }
    });
    speakers = await response.json();
}

async function showWelcomeMessage(welcome_Message = "Welcome to AstroTalk #2.0") {
    welcomeScreen.style.display = "flex";
    let charIndex = 0;
    function WordType() {
        const displayedText = welcome_Message.substring(0, charIndex++)

        welcomeMessage.textContent = displayedText;
        if (charIndex === welcome_Message.length) {
            setTimeout(() => {
            welcomeScreen.style.display = "none";
            document.body.style.overflow = "auto";
            },1000);
        }
        setTimeout(WordType, 150);
    }

    WordType();
}


async function enterPresentation() {
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
            voter_id: voter_id
        })
    });
}

async function sendVote() {
    const response = await fetch(host + '/member-vote', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "69420",
            "bypass-tunnel-reminder": "true",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            speaker: selectedSpeaker,
            voter_id: voter_id
        })
    });
    if (response.ok) {
        document.cookie = `voter_id=${selectedSpeaker}; max-age=172800; path=/;`;
        submitButton.style.display = "none";
        const speakerDiv = document.querySelector(`input[value="${selectedSpeaker}"]`).closest('.speaker');
        if (speakerDiv) {
            const checkIcon = speakerDiv.querySelector('.check-icon');
            checkIcon.style.display = 'block'; // Show the check icon
        }
        alert("Your vote has been submitted successfully!");
    }
}

async function submitVote() {
    if (!selectedSpeaker) {
        alert("Please select a speaker to vote for!");
        return;
    }
    submitButton.style.display = "none";

    try {
        await sendVote();
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(error.message);
        submitButton.style.display = "flex";
        alert("Error submitting vote. Please try again.");
    }
}

function updateVotePhotos() {
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
            selectedSpeaker = event.target.value;
            if (voter_id || timeEnded) {
                if (voter_id === event.target.value) {
                    submitButton.disabled = true;
                } else {
                    submitButton.disabled = timeEnded;
                    submitButton.style.display = "flex";
                    submitButton.textContent = timeEnded ? "Time has ended" : "Change Vote";
                    submitButton.textContent = endTime > 0 ? submitButton.textContent : "Voting hasn't started yet";
                }
            } else {
                submitButton.textContent = "Vote";
                submitButton.disabled = false;
            }
        });
    });
}

function startTimer(endTime) {
    if (isTimerRunning) {
        return;
    }
    isTimerRunning = true;
    timeEnded = false;
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

async function fetchSpeakersAndLoad() {
    let x = false;
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

    if(endTime === 0) {
        submitButton.textContent = "Voting hasn't started yet";
    }
    if (endTime >= new Date().getTime()) {
        console.log(endTime);
        console.log(new Date().getTime());
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
        
        // Add an additional container for the photo to support the check mark overlay
        speakerDiv.innerHTML = `
        <h2>${speaker.name}</h2>
        <div class="photo-container">
            <div class="wrapper">
                <img class="project" src="${speaker.png}" alt="${speaker.project}">
                <img class="speaker" src="${speaker.photo}" alt="${speaker.name}">
            </div>
            <span class="check-icon" style="display: none;">&#x2714;</span>
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
    updateVotePhotos();
    
    await showWelcomeMessage();   
}

socket.on('endTime', ({ endTime }) => {
    timerContainerElement.style.display = "flex";
    submitButton.style.display = "flex";
    submitButton.textContent = "Vote";
    startTimer(endTime);
    updateVotePhotos();
});

socket.on('connect', () => {
    console.log('Connected to the server');
});

submitButton.addEventListener('click', submitVote);

async function testIncognito(){
    detectIncognito().then(async (result) => {
        if (result.isPrivate) {
            loadingScreen.style.display = "none";
            welcomeScreen.style.display = "flex";
            welcomeMessage.style.color = "red";
            welcomeMessage.style.fontSize = "1.5rem";
            welcomeMessage.style.textAlign = "center";
            if(window.innerWidth > 640){
                welcomeMessage.style.width = "20%";
            }
            welcomeMessage.textContent = "Please disable Incognito\nWe don't do that here.";
            
            setTimeout(() => {
                window.location.href = "https://www.youtube.com/watch?v=Jw9H_OdcKC8&ab_channel=CyberTrend";
            }, 3000);
        } else {
            fetchSpeakersAndLoad();
        }
    });
}

testIncognito();
