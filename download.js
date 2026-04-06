import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

// Import your existing config if using a separate file, or initialize here
const firebaseConfig = {
    apiKey: "AIzaSyDC3SiRDD6UPj8rwCpN4tE7QRJwe7SMdXA",
    authDomain: "ticket-management-portal.firebaseapp.com",
    projectId: "ticket-management-portal",
    storageBucket: "ticket-management-portal.firebasestorage.app",
    messagingSenderId: "357207811061",
    appId: "1:357207811061:web:16201cf5ea35f9013f76bc"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase();

const downloadForm = document.getElementById('publicDownloadForm');

downloadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputName = document.getElementById('userName').value.trim().toLowerCase();
    const inputSeat = parseInt(document.getElementById('userSeat').value);

    try {
        const snapshot = await get(child(ref(db), 'Sold_Tickets'));
        
        if (snapshot.exists()) {
            const tickets = snapshot.val();
            let foundTicketId = null;

            // Search for matching name and seat
            for (const id in tickets) {
                const ticket = tickets[id];
                if (ticket.name.toLowerCase() === inputName && parseInt(ticket.seat_No) === inputSeat) {
                    foundTicketId = id;
                    break;
                }
            }

            if (foundTicketId) {
                showToast("Identity Verified", "Your QR code is being generated.", "success");
                await downloadQR(foundTicketId);
            } else {
                showToast("Verification Failed", "No record found. Check your name and seat number.", "danger");
            }
        } else {
            showToast("System Error", "No tickets found in the system.", "danger");
        }
    } catch (error) {
        console.error(error);
        showToast("Error", "Could not connect to verification server.", "danger");
    }
});

// Reusing your QR download logic
async function downloadQR(id) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${id}`;
    try {
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MNMA_Ticket_${id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        showToast("Download Failed", "QR generator is unavailable.", "danger");
    }
}

// Your refined showToast function
function showToast(title, message, type) {
    let container = document.getElementById('toast-container');
    const id = 'toast-' + Date.now();
    const html = `
        <div id="${id}" class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex"><div class="toast-body"><strong>${title}</strong>: ${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>
        </div>`;
    container.insertAdjacentHTML('beforeend', html);
    const el = document.getElementById(id);
    const bsToast = new bootstrap.Toast(el, { delay: 4000 });
    bsToast.show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
}