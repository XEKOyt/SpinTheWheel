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

// Random color generator
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Draw the wheel segments
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

        // Adjust font size based on text length
        const fontSize = Math.min(40, Math.max(20, 300 / item.length));
        
        // Draw text inside the segments
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

// Rotate the wheel on spin
let lastIndex = -1; // Keep track of the last index the arrow was on

function rotateWheel() {
    spinAngleStart *= 0.98; // Slow down gradually
    startAngle += spinAngleStart;
    drawWheel();

    spinTime += 10;

    const degrees = startAngle * 180 / Math.PI + 90;
    const index = Math.floor((360 - degrees % 360) / (360 / items.length));

    // Play sound if the arrow moves to a new segment
    if (index !== lastIndex) {
        spinSound.currentTime = 0; // Reset the sound to the beginning
        spinSound.play(); // Play the sound for each segment change
        lastIndex = index; // Update the lastIndex to the current index
    }

    if (spinTime < spinTimeTotal) {
        requestAnimationFrame(rotateWheel);
    } else {
        showWinner(items[index]);
    }
}


// Start the spin
function startSpin() {
    const speed = parseFloat(speedInput.value) || 1; // Get the speed from the input

    // Set an extreme range for the initial spin speed
    spinAngleStart = (Math.random() * 3 + 1) * speed; // Range from 1 to 4 times the speed

    // Randomize spin duration with a more reasonable range
    spinTime = 0;
    spinTimeTotal = (Math.random() * 3000 + 4000) / speed; // Random duration between 4000 ms and 7000 ms divided by speed

    spinSound.currentTime = 0; // Reset spin sound to start
    spinSound.play(); // Play spin sound
    rotateWheel();
}

// Add new items to the wheel
function addItem() {
    const newItem = itemInput.value.trim();
    if (newItem) {
        const randomColor = getRandomColor(); // Get a new random color for the item
        items.push(newItem);
        colors.push(randomColor); // Store the random color
        itemInput.value = '';
        updateItemList();
        arc = Math.PI / (items.length / 2); // Recalculate arc based on the number of items
        drawWheel();
    }
}

// Change item color
function changeItemColor(index, color) {
    colors[index] = color; // Update color for the specified index
    drawWheel(); // Redraw the wheel with the updated colors
}

// Remove an item from the wheel
function removeItem(index) {
    items.splice(index, 1); // Remove the item from the array
    colors.splice(index, 1); // Remove the corresponding color
    updateItemList(); // Update the displayed item list
    arc = Math.PI / (items.length / 2); // Recalculate arc for the wheel
    drawWheel(); // Redraw the wheel
}

// Update the displayed list of items
function updateItemList() {
    itemList.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');

        // Create input to rename the item
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

        // Create a color picker to change the item color
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = colors[index];
        colorPicker.oninput = (e) => changeItemColor(index, e.target.value);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => removeItem(index); // Call removeItem

        li.append(renameInput, colorPicker, removeBtn);
        itemList.appendChild(li);
    });
}

// Show the winner in a modal popup
function showWinner(item) {
    winSound.currentTime = 0; // Reset sound to start
    winSound.play(); // Play win sound

    // Update the modal with winner text
    document.getElementById('winner-text').innerHTML = `<strong>${item}</strong> is the <span style="color: green;">winner</span>!`;

    modal.classList.add('show'); // Show the modal
    spinSound.pause(); // Stop spin sound when winner is shown
}

// Close the modal
document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.remove('show');
});

// Event listeners
addItemButton.addEventListener('click', addItem);
spinButton.addEventListener('click', startSpin);

// Add item by pressing Enter key
itemInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addItem();
    }
});

// Dark/Light Mode Toggle
modeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.container').classList.toggle('dark-mode');
    modal.classList.toggle('dark-mode');
});

// Initial drawing
drawWheel();
