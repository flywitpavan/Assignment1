
const STORAGE_KEY = "companiesData";
let companies = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); 
let editIndex = null; 

//  DOM Elements used
const pageList = document.getElementById("page-list");
const pageForm = document.getElementById("page-form");
const menuList = document.getElementById("menu-list");
const menuNew = document.getElementById("menu-new");
const btnNew = document.getElementById("btn-new");
const btnList = document.getElementById("btn-list");
const tableBody = document.getElementById("company-table-body");
const form = document.getElementById("company-form");
const employeesDiv = document.getElementById("employees");

// Page Switching
function showList() {
  pageList.style.display = "block";
  pageForm.style.display = "none";
  menuList.classList.add("active");
  menuNew.classList.remove("active");
}

function showForm() {
  pageList.style.display = "none";
  pageForm.style.display = "block";
  menuList.classList.remove("active");
  menuNew.classList.add("active");
}

// Menu Button Events
menuList.onclick = showList;
menuNew.onclick = () => { resetForm(); showForm(); };
btnNew.onclick = () => { resetForm(); showForm(); };
btnList.onclick = showList;

// Render Company Table
function renderTable() {
  tableBody.innerHTML = "";

  if (companies.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="small">No companies yet</td></tr>`;
    return;
  }

  companies.forEach((company, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${company.companyName}</td>
        <td>${company.email}</td>
        <td>${company.phoneNumber}</td>
        <td>${company.createdAt}</td>
        <td>
          <button onclick="editCompany(${index})">✏️</button>
          <button onclick="deleteCompany(${index})">🗑️</button>
        </td>
      </tr>
    `;
  });
}

//  Delete Company 
function deleteCompany(index) {
  if (confirm("Delete this company?")) {
    companies.splice(index, 1);
    saveData();
    renderTable();
  }
}

// Edit Company
function editCompany(index) {
  editIndex = index;
  const c = companies[index];

  document.getElementById("companyName").value = c.companyName;
  document.getElementById("companyAddress").value = c.address;
  document.getElementById("companyEmail").value = c.email;
  document.getElementById("companyPhone").value = c.phoneNumber;

  employeesDiv.innerHTML = "";
  c.empInfo.forEach(employee => addEmployee(employee));

  showForm();
}

//Add Employee Section 
document.getElementById("addEmployee").onclick = () => addEmployee();

function addEmployee(data = {}) {
  const empDiv = document.createElement("div");
  empDiv.className = "block";

  empDiv.innerHTML = `
    <div class="space-between">
      <strong>Employee</strong>
      <button type="button" onclick="this.parentElement.parentElement.remove()">Remove</button>
    </div>

    <input placeholder="Employee Name" maxlength="25" value="${data.empName || ""}" required />
    <select>
      ${["Developer", "Manager", "System Admin", "Team Lead", "PM"]
        .map(role => `<option ${data.designation === role ? "selected" : ""}>${role}</option>`)
        .join("")}
    </select>
    <input type="date" value="${data.joinDate || ""}" required />
    <input type="email" placeholder="Email" maxlength="100" value="${data.email || ""}" required />
    <input placeholder="Phone" maxlength="15" value="${data.phoneNumber || ""}" required />

    <!-- Skills Section -->
    <div class="space-between">
      <h4>Skills</h4>
      <button type="button" class="btn secondary add-skill">+ Add Skill</button>
    </div>
    <div class="skills"></div>

    <!-- Education Section -->
    <div class="space-between" style="margin-top:10px">
      <h4>Education</h4>
      <button type="button" class="btn secondary add-edu">+ Add Education</button>
    </div>
    <div class="education"></div>
  `;

  // Add Skill Button
  empDiv.querySelector(".add-skill").onclick = () => {
    const skillDiv = document.createElement("div");
    skillDiv.className = "skill-block";
    skillDiv.innerHTML = `
      <select required>
        ${["Java","Angular","CSS","HTML","JavaScript","UI","SQL","React","PHP","GIT","AWS","Python","Django","C","C++","C#","Unity","R","AI","NLP","Photoshop","Node.js"]
          .map(skill => `<option>${skill}</option>`).join("")}
      </select>
      <input type="number" min="1" max="5" placeholder="Rating (1-5)" required />
      <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    empDiv.querySelector(".skills").appendChild(skillDiv);
  };

  // Add Education Button
  empDiv.querySelector(".add-edu").onclick = () => {
    const eduDiv = document.createElement("div");
    eduDiv.className = "edu-block";
    eduDiv.innerHTML = `
      <input placeholder="Institute Name" maxlength="50" required />
      <input placeholder="Course Name" maxlength="25" required />
      <input placeholder="Completed Year (e.g., Mar 2021)" required />
      <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    empDiv.querySelector(".education").appendChild(eduDiv);
  };

  // Pre-fill skills if editing
  if (data.skillInfo) {
    data.skillInfo.forEach(skill => {
      empDiv.querySelector(".add-skill").click();
      const lastSkill = empDiv.querySelector(".skills").lastChild;
      lastSkill.querySelector("select").value = skill.skillName;
      lastSkill.querySelector("input").value = skill.skillRating;
    });
  }

  // Pre-fill education if editing
  if (data.educationInfo) {
    data.educationInfo.forEach(edu => {
      empDiv.querySelector(".add-edu").click();
      const lastEdu = empDiv.querySelector(".education").lastChild;
      lastEdu.querySelectorAll("input")[0].value = edu.instituteName;
      lastEdu.querySelectorAll("input")[1].value = edu.courseName;
      lastEdu.querySelectorAll("input")[2].value = edu.completedYear;
    });
  }

  employeesDiv.appendChild(empDiv);
}

//  Form Submit 
form.onsubmit = e => {
  e.preventDefault();

  const today = new Date().toISOString().split("T")[0];
  let valid = true;

  const newCompany = {
    companyName: document.getElementById("companyName").value.trim(),
    address: document.getElementById("companyAddress").value.trim(),
    email: document.getElementById("companyEmail").value.trim(),
    phoneNumber: document.getElementById("companyPhone").value.trim(),
    createdAt: new Date().toLocaleString(),
    empInfo: []
  };

  // Loop through all employees
  employeesDiv.querySelectorAll(".block").forEach(block => {
    const fields = block.querySelectorAll("input,select");
    const emp = {
      empName: fields[0].value.trim(),
      designation: fields[1].value,
      joinDate: fields[2].value,
      email: fields[3].value.trim(),
      phoneNumber: fields[4].value.trim(),
      skillInfo: [],
      educationInfo: []
    };

    // Validate join date
    if (emp.joinDate >= today) {
      alert("Join date must be in the past.");
      valid = false;
      return;
    }

    // Skills
    block.querySelectorAll(".skill-block").forEach(s => {
      emp.skillInfo.push({
        skillName: s.querySelector("select").value,
        skillRating: s.querySelector("input").value
      });
    });

    // Education
    block.querySelectorAll(".edu-block").forEach(ed => {
      const yearValue = ed.querySelectorAll("input")[2].value.trim();
      if (!/^[A-Za-z]{3}\s\d{4}$/.test(yearValue)) {
        alert("Completed year must be in Mon YYYY format.");
        valid = false;
        return;
      }
      emp.educationInfo.push({
        instituteName: ed.querySelectorAll("input")[0].value.trim(),
        courseName: ed.querySelectorAll("input")[1].value.trim(),
        completedYear: yearValue
      });
    });

    newCompany.empInfo.push(emp);
  });

  if (!valid) return;

  // Save or Update Company
  if (editIndex !== null) {
    companies[editIndex] = newCompany;
  } else {
    companies.push(newCompany);
  }

  saveData();
  renderTable();

  // Show JSON output
  document.getElementById("json-output").style.display = "block";
  document.getElementById("json-preview").textContent = JSON.stringify(newCompany, null, 2);

  alert("Company details saved successfully.");
  showList();
};

// ===== Helper Functions
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

function resetForm() {
  form.reset();
  employeesDiv.innerHTML = "";
}

// ===== Initial Table Render =====
renderTable();
