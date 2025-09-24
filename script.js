// Back button logic
function goBack() {
  showTab('write');
  document.getElementById("back-btn").style.display = "none";
}

// Tab switching logic (main tabs)
function showTab(tabId) {
  let tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tc => tc.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');

  const mainTabs = document.getElementById('main-tabs');
  const backBtn = document.getElementById('back-btn');

  if (tabId === 'view') {
    mainTabs.style.display = 'none';
    backBtn.style.display = 'block';  // show back button when in Past Entries
    showInnerTab('my-diary');
    loadAllDiaries();
    loadPartnerDiaries();
  } else {
    mainTabs.style.display = 'flex';
    backBtn.style.display = 'none';  // hide on other tabs
  }
}

// Inner tab logic for Past Entries
function showInnerTab(innerTabId) {
  document.getElementById('my-diary-tab').classList.remove('active');
  document.getElementById('partners-diary-tab').classList.remove('active');
  document.getElementById('my-diary-entries').classList.remove('active');
  document.getElementById('partners-diary-entries').classList.remove('active');

  if (innerTabId === 'my-diary') {
    document.getElementById('my-diary-tab').classList.add('active');
    document.getElementById('my-diary-entries').classList.add('active');
    loadAllDiaries();
  } else {
    document.getElementById('partners-diary-tab').classList.add('active');
    document.getElementById('partners-diary-entries').classList.add('active');
    loadPartnerDiaries();
  }
}

//Updated window.onload function BY MUSTAFA
window.onload = () => {
  if (document.getElementById('main-tabs')) document.getElementById('main-tabs').style.display = 'flex';
  showInnerTab('my-diary');
  checkForNotifications();
  checkSharingStatus();
  
  // Set today's date
  const todayElement = document.getElementById("today-date");
  if (todayElement) {
    const today = new Date();
    todayElement.textContent = "Today: " + today.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
};
//Updated window.onload function BY MUSTAFA
// Save diary
function saveDiary() {
  const today = new Date();
  const localDate = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  const formData = new FormData();
  formData.append("action", "save");
  formData.append("entry_date", localDate);
  formData.append("good", document.getElementById("good").value);
  formData.append("good_reason", document.getElementById("good-reason").value);
  formData.append("bad", document.getElementById("bad").value);
  formData.append("bad_reason", document.getElementById("bad-reason").value);
  formData.append("content", document.getElementById("content").value);

  fetch("mydiary.php", {
    method: "POST",
    body: formData,
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        alert("Diary saved to DB!");
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch(err => {
      console.error("Save failed", err);
      alert("Could not connect to server");
    });
}

// Load single diary (if needed)
function loadDiary() {
  const date = document.getElementById("view-date").value;
  if (!date) {
    alert("Please select a date");
    return;
  }

  fetch(`mydiary.php?action=view&date=${encodeURIComponent(date)}`, {
    method: "GET",
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        const diary = data.data;
        document.getElementById("view-result").innerHTML = `
          <p><strong>Good:</strong> ${diary.good}</p>
          <p><strong>Reason:</strong> ${diary.good_reason}</p>
          <p><strong>Bad:</strong> ${diary.bad}</p>
          <p><strong>Reason:</strong> ${diary.bad_reason}</p>
          <p><strong>Diary:</strong> ${diary.content}</p>
        `;
      } else {
        document.getElementById("view-result").innerHTML = `<p>${data.message}</p>`;
      }
    })
    .catch(err => {
      console.error("View failed", err);
      document.getElementById("view-result").innerHTML = "<p>Error loading diary.</p>";
    });
}

// Edit today's diary
function editDiary() {
  const today = new Date();
  const localDate = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  fetch(`mydiary.php?action=view&date=${encodeURIComponent(localDate)}`, {
    method: "GET",
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        const diary = data.data;
        document.getElementById("good").value = diary.good;
        document.getElementById("good-reason").value = diary.good_reason;
        document.getElementById("bad").value = diary.bad;
        document.getElementById("bad-reason").value = diary.bad_reason;
        document.getElementById("content").value = diary.content;
        alert("You can now edit today's diary. Make sure to save it again.");
      } else {
        alert("No diary entry exists for today.");
      }
    })
    .catch(err => {
      console.error("Edit load failed", err);
      alert("Error loading diary for edit.");
    });
}

// Link partner
function linkPartner() {
  const partnerUsername = document.getElementById("partnerUsername").value;
  if (!partnerUsername) {
    alert("Please enter a partner username");
    return;
  }

  const formData = new FormData();
  formData.append("partner_username", partnerUsername);

  fetch("set_partner.php", {
    method: "POST",
    body: formData,
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("partnerMessage").innerText = data.success;
      } else {
        document.getElementById("partnerMessage").innerText = data.error;
      }
    })
    .catch(err => {
      console.error("Link failed", err);
      document.getElementById("partnerMessage").innerText = "Error linking partner";
    });
}

// Load past diaries
function loadAllDiaries() {
  fetch("mydiary.php?action=list", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        renderEntries(data.entries, "entries-list");
      } else {
        document.getElementById("entries-list").innerHTML = "<p>No entries found.</p>";
      }
    })
    .catch(err => {
      console.error("Error loading all diaries", err);
      if (document.getElementById("entries-list")) {
        document.getElementById("entries-list").innerHTML = "<p>Error loading diaries.</p>";
      }
    });
}

function loadPartnerDiaries() {
  fetch("mydiary.php?action=partner_list", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        renderEntries(data.entries, "partners-entries-list");
      } else {
        document.getElementById("partners-entries-list").innerHTML = "<p>No partner entries found.</p>";
      }
    })
    .catch(err => {
      console.error("Error loading partner diaries", err);
      if (document.getElementById("partners-entries-list")) {
        document.getElementById("partners-entries-list").innerHTML = "<p>Error loading partner diaries.</p>";
      }
    });
}

// UPDATE BY MUSTAFA : Show good/bad things in past entries
function renderEntries(entries, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!entries || entries.length === 0) {
    container.innerHTML = "<p>No diary entries found.</p>";
    return;
  }

  entries.forEach(entry => {
    const card = document.createElement("div");
    card.classList.add("entry-card");
    card.innerHTML = `
      <h3>${formatDate(entry.entry_date)}</h3>
      <div class="entry-content">
        ${entry.good ? `<p><strong>Good:</strong> ${entry.good}</p>` : ''}
        ${entry.good_reason ? `<p><strong>Reason:</strong> ${entry.good_reason}</p>` : ''}
        ${entry.bad ? `<p><strong>Bad:</strong> ${entry.bad}</p>` : ''}
        ${entry.bad_reason ? `<p><strong>Reason:</strong> ${entry.bad_reason}</p>` : ''}
        ${entry.content ? `<p><strong>Diary:</strong> ${entry.content.substring(0, 120)}...</p>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function filterEntries() {
  const date = document.getElementById("search-date").value;
  const text = document.getElementById("search-text").value.toLowerCase();

  fetch("mydiary.php?action=list", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        let filtered = data.entries;

        if (date) {
          filtered = filtered.filter(e => e.entry_date === date);
        }
        if (text) {
          filtered = filtered.filter(e =>
            (e.content && e.content.toLowerCase().includes(text)) ||
            (e.good && e.good.toLowerCase().includes(text)) ||
            (e.bad && e.bad.toLowerCase().includes(text))
          );
        }

        renderEntries(filtered, "entries-list");
      }
    })
    .catch(err => console.error("Filter failed", err));
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// =============== ANGRY MODE FUNCTIONS ===============
// Added the Missing JavaScript Functions BY MUSTAFA
function sendAngryRequest() {
  fetch("send_request.php", { 
    method: "POST",
    credentials: "include" 
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert("Sharing request sent to your partner!");
        checkSharingStatus(); // Show revoke button if needed
      }
    })
    .catch(err => {
      console.error("Request failed", err);
      alert("Could not send request");
    });
}

function checkForNotifications() {
  fetch("manage_requests.php", { 
    method: "GET",
    credentials: "include" 
  })
    .then(res => res.json())
    .then(data => {
      if (data.incoming && data.incoming.length > 0) {
        showNotification(data.incoming[0]);
      }
    })
    .catch(err => console.error("Notification check failed", err));
}

function showNotification(request) {
  // Add notification HTML to Write Today section
  const writeSection = document.getElementById("write");
  const existingNotification = document.getElementById("partner-notification");
  
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notificationDiv = document.createElement("div");
  notificationDiv.id = "partner-notification";
  notificationDiv.innerHTML = `
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 10px 0;">
      <h4>📬 Diary Sharing Request</h4>
      <p><strong>${request.from}</strong> wants to share diaries with you.</p>
      <button onclick="handleRequest('accept', ${request.id})" style="background: #00b894; color: white; margin-right: 10px; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Accept</button>
      <button onclick="handleRequest('reject', ${request.id})" style="background: #e17055; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Reject</button>
    </div>
  `;
  
  writeSection.insertBefore(notificationDiv, writeSection.firstChild);
}

function handleRequest(action, requestId) {
  const formData = new FormData();
  formData.append("id", requestId);
  formData.append("action", action);
  
  fetch("respond_requests.php", {
    method: "POST",
    body: formData,
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("partner-notification").remove();
        alert(`Request ${action}ed successfully!`);
        if (action === 'accept') {
          checkSharingStatus();
        }
      } else {
        alert("Error: " + data.error);
      }
    });
}

function checkSharingStatus() {
  fetch("check_my_access.php", { 
    method: "GET",
    credentials: "include" 
  })
    .then(res => res.json())
    .then(data => {
      const writeSection = document.getElementById("write");
      const existingRevoke = document.getElementById("revoke-button");
      
      if (existingRevoke) {
        existingRevoke.remove();
      }
      
      if (data.has_access) {
        const revokeDiv = document.createElement("div");
        revokeDiv.id = "revoke-button";
        revokeDiv.innerHTML = `
          <div style="background: #fee; border: 1px solid #fcc; padding: 10px; border-radius: 8px; margin: 10px 0;">
            <p>🔗 You are sharing diaries with <strong>${data.partner_name}</strong></p>
            <button onclick="revokeSharing()" style="background: #e17055; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer;">Stop Sharing</button>
          </div>
        `;
        writeSection.appendChild(revokeDiv);
      }
    })
    .catch(err => console.error("Sharing status check failed", err));
}

function revokeSharing() {
  if (confirm("Are you sure you want to stop sharing diaries?")) {
    fetch("revoke_access.php", { 
      method: "POST",
      credentials: "include" 
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById("revoke-button").remove();
          alert("Diary sharing stopped");
        } else {
          alert("Error: " + data.error);
        }
      });
  }
}
// Added the Missing JavaScript Functions BY MUSTAFA