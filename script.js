const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spin-button');
const addItemButton = document.getElementById('add-item');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const modal = document.createElement('div'); // Popup modal

modal.classList.add('modal');
document.body.appendChild(modal); // Add the modal to the body

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
        
        // Draw text inside the segments with larger font
        ctx.save();
        ctx.fillStyle = "black";
        ctx.font = 'bold 40px Arial';  // Adjust font size here
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
function rotateWheel() {
    spinAngleStart *= 0.98; // Slow down gradually
    startAngle += spinAngleStart;
    drawWheel();
    
    spinTime += 10;
    if (spinTime < spinTimeTotal) {
        requestAnimationFrame(rotateWheel);
    } else {
        const degrees = startAngle * 180 / Math.PI + 90;
        const index = Math.floor((360 - degrees % 360) / (360 / items.length));
        showWinner(items[index]);
    }
}

// Start the spin
function startSpin() {
    spinAngleStart = Math.random() * 0.4 + 0.3; // Start fast, then slow down
    spinTime = 0;
    spinTimeTotal = Math.random() * 3000 + 5000;
    rotateWheel();
}

// Add new items to the wheel
function addItem() {
    const newItem = itemInput.value.trim();
    if (newItem) {
        const randomColor = getRandomColor();
        items.push(newItem);
        colors.push(randomColor);
        itemInput.value = '';
        updateItemList();
        arc = Math.PI / (items.length / 2); // Recalculate arc based on the number of items
        drawWheel();
    }
}

// Remove an item from the list
function removeItem(index) {
    items.splice(index, 1);
    colors.splice(index, 1);
    updateItemList();
    arc = Math.PI / (items.length / 2); // Update arc after removal
    drawWheel();
}

// Change color of an existing item
function changeItemColor(index, newColor) {
    colors[index] = newColor;
    drawWheel();
}

// Update the displayed list of items
function updateItemList() {
    itemList.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = colors[index];
        colorPicker.oninput = (e) => changeItemColor(index, e.target.value);

        li.textContent = item;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => removeItem(index);

        li.prepend(colorPicker); // Color picker (i hope ill learn how to make it smother cuz its kinda bad)
        li.appendChild(removeBtn);
        itemList.appendChild(li);
    });
}

const sound = new Audio('win.mp3'); // Load your sound file

// Show the winner in a modal popup
function showWinner(item) {
    // Play the winner sound
    sound.currentTime = 0; // Reset sound to start
    sound.play(); // Play sound

    modal.innerHTML = `
    <div style="text-align: center;">
        <h2>Congratulations!</h2>
        <p style="color: black;"><strong>${item}</strong> is the <span style="color: green;">winner</span>!</p>
        <button id="close-modal">Close</button>
    </div>
    `;

    modal.classList.add('show');

    document.getElementById('close-modal').addEventListener('click', () => {
        modal.classList.remove('show');
    });
}


// Event listeners
addItemButton.addEventListener('click', addItem);
spinButton.addEventListener('click', startSpin);

drawWheel();
