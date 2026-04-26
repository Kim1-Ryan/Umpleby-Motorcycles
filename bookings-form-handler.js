window.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("bookings-form");
    const formMessage = document.getElementById("form-message");
    const scriptURL = 'https://script.google.com/macros/s/AKfycbw6wCvSB6F6nwjgxZmzmXZCCR-3OsfKDG5y9H0AEExakFp8_3FgUlBAB0NXa_DEygQsVA/exec';

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent default submit
        
        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";

        fetch(scriptURL, { method: "POST", body: new FormData(form) })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    formMessage.textContent = "Thank you! Your request has been sent successfully.";
                    formMessage.className = "success";
                    form.reset();
                } else {
                    formMessage.textContent = "Eish! Something went wrong. " + data.message;
                    formMessage.className = "error";
                }
            })
            .catch(error => {
                console.error("Error!", error.message);
                formMessage.textContent = "An error occurred. Please try again later.";
                formMessage.className = "error";
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Confirm Booking";
            });
    });
});