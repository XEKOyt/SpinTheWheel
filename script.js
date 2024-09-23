const winSound = new Audio('win.mp3'); // Sound for winner announcement
const spinSound = new Audio('E.MP3'); // Sound for spinning

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spin-button');
const addItemButton = document.getElementById('add-item');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const modal = document.querySelector('.modal');
const modeToggle = document.getElementById('mode-toggle');

const speedInput = document.getElementById('speed-input'); // Speed input field

let items = [];
let colors = [];
let startAngle = 0;
let arc = Math.PI / (items.length / 2);
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function drawWheel() {
    const wheelRadius = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach((item, i) => {
        const angle = startAngle + i * arc;
        ctx.beginPath();
        ctx.arc(wheelRadius, wheelRadius, wheelRadius, angle, angle + arc, false);
        ctx.lineTo(wheelRadius, wheelRadius);
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.stroke();

        const fontSize = Math.min(40, Math.max(20, 300 / item.length));
        
        ctx.save();
        ctx.fillStyle = "black";
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.translate(
            wheelRadius + Math.cos(angle + arc / 2) * wheelRadius / 1.5,
            wheelRadius + Math.sin(angle + arc / 2) * wheelRadius / 1.5
        );
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        ctx.fillText(item, -ctx.measureText(item).width / 2, 0);
        ctx.restore();
    });
}

let lastIndex = -1;

function rotateWheel() {
    spinAngleStart *= 0.98; 
    startAngle += spinAngleStart;
    drawWheel();

    spinTime += 10;

    const degrees = startAngle * 180 / Math.PI + 90;
    const index = Math.floor((360 - degrees % 360) / (360 / items.length));

    if (index !== lastIndex) {
        spinSound.currentTime = 0;
        spinSound.play();
        lastIndex = index; 
    }

    if (spinTime < spinTimeTotal) {
        requestAnimationFrame(rotateWheel);
    } else {
        showWinner(items[index]);
    }
}

function startSpin() {
    const speed = parseFloat(speedInput.value) || 1; 
    
    spinAngleStart = (Math.random() * 3 + 1) * speed; 

    spinTime = 0;
    spinTimeTotal = (Math.random() * 3000 + 4000) / speed; 

    spinSound.currentTime = 0; 
    spinSound.play();
    rotateWheel();
}

function addItem() {
    const newItem = itemInput.value.trim();
    if (newItem) {
        const randomColor = getRandomColor(); 
        items.push(newItem);
        colors.push(randomColor); 
        itemInput.value = '';
        updateItemList();
        arc = Math.PI / (items.length / 2); 
        drawWheel();
    }
}

function changeItemColor(index, color) {
    colors[index] = color; 
    drawWheel(); 
}

function removeItem(index) {
    items.splice(index, 1);
    colors.splice(index, 1); 
    updateItemList(); 
    arc = Math.PI / (items.length / 2); 
    drawWheel(); 
}

function updateItemList() {
    itemList.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');

        const renameInput = document.createElement('input');
        renameInput.type = 'text';
        renameInput.value = item;
        renameInput.onchange = (e) => {
            if (e.target.value.trim() !== '') {
                items[index] = e.target.value.trim();
                drawWheel();
            } else {
                e.target.value = item;
            }
        };

        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = colors[index];
        colorPicker.oninput = (e) => changeItemColor(index, e.target.value);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => removeItem(index); 

        li.append(renameInput, colorPicker, removeBtn);
        itemList.appendChild(li);
    });
}

function showWinner(item) {
    winSound.currentTime = 0;
    winSound.play(); 

    document.getElementById('winner-text').innerHTML = `<strong>${item}</strong> is the <span style="color: green;">winner</span>!`;

    modal.classList.add('show'); 
    spinSound.pause(); 
}

document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.remove('show');
});

addItemButton.addEventListener('click', addItem);
spinButton.addEventListener('click', startSpin);

itemInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addItem();
    }
});

modeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.container').classList.toggle('dark-mode');
    modal.classList.toggle('dark-mode');
});

drawWheel();
