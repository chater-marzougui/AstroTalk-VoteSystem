function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomAsteroidImage() {
    const images = ['https://chater-marzougui.github.io/Portfolio/assets/images/meteor1.png','https://chater-marzougui.github.io/Portfolio/assets/images/meteor2.png',
         'https://chater-marzougui.github.io/Portfolio/assets/images/meteor3.png', 'https://chater-marzougui.github.io/Portfolio/assets/images/meteor2.png', 'https://chater-marzougui.github.io/Portfolio/assets/images/meteor3.png',
         'https://chater-marzougui.github.io/Portfolio/assets/images/meteor4.png', 'https://chater-marzougui.github.io/Portfolio/assets/images/meteor5.png', 'https://chater-marzougui.github.io/Portfolio/assets/images/meteor6.png'];
    return images[getRandomInt(0, images.length)];
}

function createAsteroid() {
    const asteroid = document.createElement('div');
    asteroid.classList.add('asteroid');

    const startX = getRandomInt(0, window.innerWidth);
    const startY = getRandomInt(0, window.innerHeight);

    asteroid.style.left = `${startX}px`;
    asteroid.style.top = `${startY}px`;
    asteroid.style.backgroundImage = `url('${getRandomAsteroidImage()}')`;

    const endX = startX - window.innerWidth;
    const endY = window.innerHeight;

    asteroid.style.setProperty('--x-end', `${endX}px`);
    asteroid.style.setProperty('--y-end', `${endY}px`);
    asteroid.style.animation = `move-asteroid ${Math.random() * 3}s linear`;

    document.getElementById('asteroid-container').appendChild(asteroid);
    asteroid.addEventListener('animationend', () => {
        asteroid.remove();
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const starrySky = document.querySelector('.starry-sky');
    const starCount = 300;

    for (let i = 0; i < starCount; i++) {
        let star = document.createElement('div');
        star.classList.add('star');
        let size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 97}%`;
        star.style.left = `${Math.random() * 94 + 3}%`;
        star.style.animationDuration = `${Math.random() * 5 + 12}s`;
        star.style.animationDelay = `${Math.random() * 10}s`;

        starrySky.appendChild(star);
    }
});

setInterval(createAsteroid, 2000);
