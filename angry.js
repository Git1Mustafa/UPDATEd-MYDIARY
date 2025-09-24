let incomingRequests = [];
let activeShare = null;

function loadIncomingRequests() {
  fetch("manage_requests.php")
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        console.error(data.error);
        return;
      }
      incomingRequests = data.incoming || [];
      
      // Check if current user has any accepted requests (where they are sender)
      if (data.accepted_request) {
        activeShare = {
          from: data.accepted_request.receiver_name,
          partner_id: data.accepted_request.receiver_id,
          id: data.accepted_request.id
        };
      } else {
        activeShare = null;
      }
      
      renderIncoming();
      renderShared();
    });
}

// Render incoming requests
function renderIncoming() {
  const box = document.getElementById("incomingRequests");
  if (incomingRequests.length === 0) {
    box.innerHTML = "<p>No incoming requests.</p>";
    return;
  }

  box.innerHTML = incomingRequests.map((req, i) => `
    <div class="request-box">
      <p><strong>Request from: ${req.from}</strong></p>
      <button onclick="acceptRequest(${i})">Accept</button>
      <button onclick="rejectRequest(${i})">Reject</button>
    </div>
  `).join("");
}

// Accept request
function acceptRequest(i) {
  const request = incomingRequests[i];
  fetch("respond_requests.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${request.id}&action=accept`
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) { alert(data.error); return; }
    
    incomingRequests.splice(i, 1);
    renderIncoming();
    renderShared();
    alert(`✅ Request from ${request.from} accepted. They now have access to your diary.`);;
  });
}
//reject request
function rejectRequest(i) {
  const request = incomingRequests[i];
  fetch("respond_requests.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${request.id}&action=reject`
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) { alert(data.error); return; }
    incomingRequests.splice(i, 1);
    renderIncoming();
    alert(`❌ Request from ${request.from} rejected`);
  });
}


// Render shared diary
function renderShared() {
  const box = document.getElementById("sharedEntries");
  
  // Check if current user has access to partner's diary
  fetch("check_my_access.php")
    .then(res => res.json())
    .then(data => {
      if (data.error || !data.has_access) {
        box.innerHTML = "<p>No shared diary access currently active.</p>";
        activeShare = null;
        return;
      }

      // User has access to partner's diary
      activeShare = {
        from: data.partner_name,
        has_access: true
      };

      let diaryhtml = data.entries.map(e => `
       <div class="request-box">
        <p><strong>${e.date}</strong></p>
        <p><strong>Good:</strong> ${e.good || 'N/A'}</p>
        <p><strong>Reason:</strong> ${e.good_reason || 'N/A'}</p>
        <p><strong>Bad:</strong> ${e.bad || 'N/A'}</p>
        <p><strong>Reason:</strong> ${e.bad_reason || 'N/A'}</p>
        <p><strong>Diary:</strong> ${e.content || 'N/A'}</p>
       </div>
      `).join(""); 

      box.innerHTML = `
        <p>You have access to <strong>${data.partner_name}</strong>'s diary.</p>
        <button onclick="revokeMyAccess()">Stop Sharing</button>
        <h3>${data.partner_name}'s Diary Entries:</h3>
        ${diaryhtml}
      `;
    });
}

function revokeMyAccess() {
  // Delete the accepted request
  fetch("revoke_access.php", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      alert("❌ Access revoked");
      activeShare = null;
      renderShared();
    });
}


// Send request to partner
function toggleAngryMode() {
  fetch("send_request.php", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.error) return alert(data.error);
      alert(data.success);
      loadIncomingRequests(); // update incoming requests
    });
}

// Initial load
loadIncomingRequests();
renderShared();
document.getElementById("sendRequest").addEventListener("click", toggleAngryMode);