let password = "";

const fields = [
  "welcome",
  "one",
  "two",
  "three",
  "invalid"
];

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Eroare");
  }

  return data;
}

async function login() {
  password = document.getElementById("password").value;

  try {
    const data = await request("/api/messages");

    fields.forEach(id => {
      document.getElementById(id).value = data[id];
    });

    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("panel").classList.remove("hidden");
    document.getElementById("status").textContent = "Online";
  } catch (error) {
    document.getElementById("error").textContent = error.message;
  }
}

async function save() {
  const data = {};

  fields.forEach(id => {
    data[id] = document.getElementById(id).value;
  });

  try {
    await request("/api/messages", {
      method: "POST",
      body: JSON.stringify(data)
    });

    document.getElementById("saved").textContent =
      "✓ Mesajele au fost salvate!";
  } catch (error) {
    document.getElementById("saved").textContent = error.message;
  }
}
