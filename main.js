/* ======= ABOUT LOGIC ======= */
const customFontOptions = ['Franklin Gothic Medium',
                           'Courier New',
                           'Lucida Sans',
                           'Times New Roman',
                           'Arial'
                            ];
let customFontIndex = 0;

const customTextChange = setInterval(() => {
    document.getElementById('customize-text').style.fontFamily = customFontOptions[customFontIndex++];
    if (customFontIndex + 1 > customFontOptions.length) customFontIndex = 0;
}, 1000);
/* ======= ABOUT LOGIC ======= */

/* ======= SANDBOX LOGIC ======= */
const sandboxEmptySection = document.getElementById('sandbox_empty');
const sandboxCheckboxes = document.querySelectorAll('input.sandbox-checkbox');
let currentSandboxCheck = sandboxCheckboxes.length;

sandboxCheckboxes.forEach(box => {
    box.addEventListener('change', () => {
        if (!box.checked) {
            currentSandboxCheck--;
            if (!currentSandboxCheck) toggleSandboxSection(sandboxEmptySection);
            return;
        }
        
        currentSandboxCheck++;
        if (currentSandboxCheck === 1) toggleSandboxSection(sandboxEmptySection);
    });
});

const toggleSandboxSection = section => { 
    section.classList.toggle('shown');
    section.classList.toggle('hidden');
}
/* ======= SANDBOX LOGIC ======= */

/* ======= FORM LOGIC ======= */
const form = document.getElementById('form');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
    const lastNameInput = document.getElementById("last_name").value;
    const emailInput = document.getElementById("email").value;
    if (lastNameInput) {
        e.preventDefault();
        alert('Please enter a valid last name.');
        return;
    }
    if (!emailInput.includes('@')) {
        console.log(emailInput)
        e.preventDefault();
        alert('Please enter a valid email address.');
        return;
    }
    
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("access_key", "b6c808aa-a717-4acb-90c2-709389fe381a");

    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert("Success! Your message has been sent.");
            form.reset();
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        alert("Something went wrong. Please try again.");
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});
/* ======= FORM LOGIC ======= */