medTimer = [];
interval = null;
version = "1.2.0";

function setVersion() {
    document.getElementById("version").innerHTML = `Version: ${version}`;
}

function loadFromLocalStorage() {
    const medTimerLocalStorage = localStorage.getItem('medTimer');

    if (!medTimerLocalStorage || !JSON.parse(medTimerLocalStorage)) {
        // If medTimer is not found, initialize it with an empty array
        localStorage.setItem('medTimer', JSON.stringify({ data: [] }));
        medTimer = [];
    } else {
        medTimer = JSON.parse(medTimerLocalStorage).data;
    }
}

function saveToLocalStorage() {
    localStorage.setItem('medTimer', JSON.stringify({ data: medTimer }));
}

function clearAll() {
    if (confirm('Are you sure you want to delete all medications?')) {
        localStorage.removeItem('medTimer');
        medTimer = [];
        saveToLocalStorage();
        loadMedications();
        loadLastMedication();
    }
}

function compareMedication(a, b) {
    const now = new Date();

    const aDate = new Date(a.date + ' ' + a.time);
    const aTimeDiff = aDate.setHours(aDate.getHours() + parseInt(a.hours)) - now;

    const bDate = new Date(b.date + ' ' + b.time);
    const bTimeDiff = bDate.setHours(bDate.getHours() + parseInt(b.hours)) - now;

    if (aTimeDiff < bTimeDiff) {
        return -1;
    }
    if (aTimeDiff > bTimeDiff) {
        return 1;
    }
    return 0;
}

function addMedication() {
    const form = document.getElementById("medForm");
    const name = form.elements["name"].value;
    const date = form.elements["date"].value;
    const time = form.elements["time"].value;
    const hours = form.elements["hours"].value;

    const medication = { name, date, time, hours };
    medTimer.unshift(medication);
    saveToLocalStorage();
    loadMedications();
    loadLastMedication();
}

function deleteMedication(index) {
    if (confirm('Are you sure you want to delete this medication?')) {
        medTimer.splice(index, 1);
        saveToLocalStorage();
        loadMedications();
        loadLastMedication();
    }
}

function loadLastMedication() {
    const body = document.getElementById("body");
    const medications = document.getElementById("medications");
    const container = document.getElementById("timer");

    interval = setInterval(() => {
        const now = new Date();
        const lastMedication = medTimer.sort(compareMedication)[0];

        if (!lastMedication) {
            clearInterval(interval);
            container.innerHTML = `No medication found.`;
            body.className = "";
            return;
        }

        const date = new Date(lastMedication.date + ' ' + lastMedication.time);
        const timeDiff = date.setHours(date.getHours() + parseInt(lastMedication.hours)) - now;
        const hours = Math.floor((Math.abs(timeDiff) / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((Math.abs(timeDiff) / (1000 * 60)) % 60);
        const seconds = Math.floor((Math.abs(timeDiff) / 1000) % 60);

        if (timeDiff < 0) {
            body.className = "red";
            medications.className = "red";
            container.innerHTML = `Time past due:<br>`;
        } else {
            body.className = "green";
            medications.className = "green";
            container.innerHTML = `Next dose due in:<br>`;
        }
        container.innerHTML += `${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

function loadMedications() {
    const container = document.getElementById("medications");
    container.innerHTML = "";

    if (medTimer.length === 0) {
        return;
    }

    const table = document.createElement("table");
    const tableHeader = document.createElement("thead");
    const tableBody = document.createElement("tbody");
    const headerRow = document.createElement("tr");
    tableHeader.appendChild(headerRow);
    headerRow.innerHTML = `<th>Name</th><th>Date/Time</th><th class="hide">Interval (h)</th><th>X</th>`;
    table.appendChild(tableHeader);
    medTimer.sort(compareMedication).forEach((medication, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${medication.name}</td>
            <td>${medication.date}<br>${medication.time}</td>
            <td class="hide">${medication.hours}</td>
            <td><button type="button" onclick="deleteMedication(${medication.index})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);
    container.appendChild(table);
}

function setFormDefaults() {
    const medForm = document.getElementById("medForm");
    const nameInput = medForm.elements["name"];
    const defaultName = 'Acetaminophen';
    nameInput.value = defaultName;

    const dateInput = medForm.elements["date"];
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1; // Months are zero-based
    const year = now.getFullYear();
    dateInput.value = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    

    const timeInput = medForm.elements["time"];
    const hours = now.getHours();
    const minutes = now.getMinutes();
    timeInput.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const hoursInput = medForm.elements["hours"];
    const defaultHours = 6;
    hoursInput.value = defaultHours;
}

function init() {
    setVersion();
    loadFromLocalStorage();
    loadLastMedication();
    setFormDefaults()
    loadMedications()
}

