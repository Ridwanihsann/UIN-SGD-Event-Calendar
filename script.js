const firebaseConfig = {
  apiKey: "AIzaSyBWL4mff5T1l0DqmZVXQw9stMQkTVCbNOU",
  authDomain: "event-calendar-uin-sgd.firebaseapp.com",
  databaseURL: "https://event-calendar-uin-sgd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "event-calendar-uin-sgd",
  storageBucket: "event-calendar-uin-sgd.appspot.com",
  messagingSenderId: "944884355637",
  appId: "1:944884355637:web:a5a530544fd2b5dbf6d77c"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function login(e) {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value;
  const password = form.password.value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'admin.html';
    })
    .catch(error => {
      alert(error.message);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('calendar.html')) {
    loadEvents();
  } else if (window.location.pathname.endsWith('admin.html')) {
    const form = document.getElementById('eventForm');
    form.addEventListener('submit', addEvent);
  } else if (window.location.pathname.endsWith('login.html')) {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', login);
  }
});

function loadEvents() {
  const eventsRef = firebase.database().ref('events');
  eventsRef.on('value', (snapshot) => {
    const events = snapshot.val();
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: Object.values(events || {}).map(event => ({
        title: event.name,
        start: event.date,
        end: event.endDate,
        event: event
      }))
    });
    calendar.render();
    calendar.on('eventClick', function(info) {
      const event = info.event.extendedProps.event;
      const eventDetailsDiv = document.getElementById('eventDetails');
      const eventTitleEl = document.getElementById('eventTitle');
      const eventDateEl = document.getElementById('eventDate');
      const eventDescriptionEl = document.getElementById('eventDescription');
      const eventImageEl = document.getElementById('eventImage');
      const eventContactPersonEl = document.getElementById('eventContactPerson');

      eventTitleEl.textContent = event.name;
      eventDateEl.textContent = `Tanggal: ${event.date} - ${event.endDate}`;
      eventDescriptionEl.textContent = event.description;
      eventImageEl.src = event.image || '';
      eventContactPersonEl.textContent = event.contactPerson;

      eventDetailsDiv.classList.remove('hidden');
    });
  });
}

function addEvent(e) {
  e.preventDefault();
  const form = e.target;
  const event = {
    name: form.name.value,
    date: form.date.value,
    endDate: form.endDate.value,
    description: form.description.value,
    image: '',
    contactPerson: form.contactPerson.value,
  };

  const imageFile = form.imageInput.files[0];
  if (imageFile) {
    const storageRef = firebase.storage().ref(`images/${imageFile.name}`);
    storageRef.put(imageFile)
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(downloadURL => {
        event.image = downloadURL;
        saveEventToDatabase(event);
      })
      .catch(error => {
        console.error('Error uploading image:', error);
      });
  } else {
    saveEventToDatabase(event);
  }
}

function saveEventToDatabase(event) {
  const eventsRef = firebase.database().ref('events');
  eventsRef.push(event)
    .then(() => {
      alert('Acara baru berhasil ditambahkan!');
      document.getElementById('eventForm').reset();
      loadEvents();
    })
    .catch(error => {
      console.error('Error:', error);
    });
}