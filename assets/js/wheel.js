class SpeakerWheel {
    constructor() {
        this.wheel = document.getElementById('wheel');
        this.spinButton = document.getElementById('spinButton');
        this.selectedSpeakerElement = document.getElementById('selectedSpeaker');
        this.selectedSpeakersElement = document.getElementById('selectedSpeakers');
        this.cardsContainer = document.getElementById('cards-container');
        this.speakers = [];
        this.selectedSpeakers = [];
        this.currentRotation = 0;
        this.isSpinning = false;

        this.spinButton.addEventListener('click', () => this.spin());
    }

    async init() {
        await this.fetchSpeakers();
        this.renderWheel();
        this.renderSelectedSpeakers();
    }

    renderSelectedSpeakers() {
        this.selectedSpeakersElement.innerHTML = this.selectedSpeakers
            .map((speaker, index) => `
                <div class="selected-speaker-item">
                    <div class="number">${index + 1}</div>
                    <img src="${speaker.photo}" alt="${speaker.name}">
                    <div class="selected-speaker-info">
                        <div class="name">${speaker.name}</div>
                        <div class="project">${speaker.project}</div>
                    </div>
                </div>
            `).join('');
        this.selectedSpeakersElement.style.visibility = this.selectedSpeakers.length > 0 ? 'visible' : 'hidden';
    }

    renderCards() {
        document.getElementById('main-row').style.display = 'none';
        document.getElementById('selectedSpeakers').style.display = 'none';
        
        const cardsContainer = document.getElementById('cards-container');
        cardsContainer.style.display = 'flex';
    
        cardsContainer.innerHTML = this.selectedSpeakers
            .map((speaker, index) => `
                <div class="card">
                    <div class="wrapper">
                        <img src="${speaker.photo}" class="cover-image" />  
                    </div>
                    <h3 class="title">${index + 1}. ${speaker.name}</h3>
                    <img src="${speaker.png}" class="character" />
                </div>
            `).join('');
        // Add animation after a brief delay to ensure DOM is ready
        requestAnimationFrame(() => {
            const cards = cardsContainer.querySelectorAll('.card');
            cards.forEach(card => {
                card.classList.add('show');
            });
        });
    }

    showSelectionDialog(winner) {
        const dialog = document.getElementById('selectionDialog');
        const overlay = document.getElementById('overlay');
        const dialogImage = document.getElementById('dialogImage');
        const dialogName = document.getElementById('dialogName');
        const dialogProject = document.getElementById('dialogProject');

        dialogImage.src = winner.photo;
        dialogName.textContent = winner.name;
        dialogProject.textContent = `${winner.project}`;

        overlay.style.display = 'block';
        dialog.style.display = 'block';
    }

    async fetchSpeakers() {
        let x = false;
        const host = "https://astrotalk.loca.lt";

        do {
            try {
                const response = await fetch(host + '/speakers', {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                        'bypass-tunnel-reminder': 'true'
                    }
                });
                const data = await response.json();
                this.speakers = data.speakers;
                x = true;
            } catch (e) {
                console.error(e);
            }
        } while (!x);
    }

    getColor(index, total) {
        const hue = (index * 360) / total;
        return `hsl(${hue}, 70%, 60%)`;
    }

    renderWheel() {
        this.wheel.innerHTML = '';
        const angleStep = 360 / this.speakers.length;
        
        // Create wheel background
        let wheelBg = this.speakers.map((_, i) => {
            const color = this.getColor(i, this.speakers.length);
            const start = i * angleStep;
            const end = (i + 1) * angleStep;
            return `${color} ${start}deg ${end}deg`;
        }).join(', ');
        
        this.wheel.style.background = `conic-gradient(${wheelBg})`;

        // Add speakers
        this.speakers.forEach((speaker, i) => {
            const speakerEl = document.createElement('div');
            speakerEl.className = 'speaker';
            speakerEl.style.transform = `rotate(${i * angleStep + angleStep/2}deg) translateY(-15px)`;
            
            speakerEl.innerHTML = `
                <img src="${speaker.photo}" alt="${speaker.name}">
                <p>${speaker.name}</p>
            `;
            
            this.wheel.appendChild(speakerEl);
        });
    }
    
    applySelectedAndSelected(speakerIndex) {
        const winner = this.speakers[speakerIndex];
        this.selectedSpeakers.push(winner);
        this.speakers.splice(speakerIndex, 1);
        if(this.speakers.length != 0) this.showSelectionDialog(winner);
        this.renderSelectedSpeakers();
    }

    startSpin() {
        if (this.isSpinning || this.speakers.length === 0) return;
        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.spin();
    }


    spin() {

        // Calculate spin
        const extraSpins = 5;
        const randomAngle = Math.random() * 360;
        const totalRotation = 360 * extraSpins + randomAngle;
        this.currentRotation += totalRotation;

        // Apply rotation

        this.wheel.style.transform = `rotate(${this.currentRotation}deg)`;

        // Calculate winner
        setTimeout(() => {
            const normalizedRotation = this.currentRotation % 360;
            const speakerIndex = Math.floor(
                (360 - (normalizedRotation % 360)) / (360 / this.speakers.length)
            ) % this.speakers.length;
            
            this.applySelectedAndSelected(speakerIndex);

            this.isSpinning = false;
            this.spinButton.disabled = false;
            this.renderWheel();
            if (this.speakers.length === 1) {
                this.applySelectedAndSelected(0);
                this.renderWheel();
                this.spinButton.disabled = true;
                this.spinButton.textContent = 'All Speakers Selected';
            }
        }, 5000);
    }
}
const speakerWheel = new SpeakerWheel();
speakerWheel.init();

function closeDialog() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('selectionDialog').style.display = 'none';
    if(speakerWheel.speakers.length === 0 ) speakerWheel.renderCards();
}