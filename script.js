const result = document.getElementById("result");
const history = document.getElementById("history");
const buttons = document.querySelector(".buttons");

let expression = "";
let finished = false;

// Menampilkan angka atau operasi ke layar
function updateDisplay() {
    result.value = expression || "0";

    result.value = result.value
        .replace(/\*/g, "×")
        .replace(/\//g, "÷")
        .replace(/-/g, "−");
}

// Menghitung ekspresi dengan karakter yang dibatasi
function calculate() {
    if (!expression) return;

    try {
        if (!/^[0-9+\-*/%. ]+$/.test(expression)) {
            throw new Error("Ekspresi tidak valid");
        }

        if (/[+\-*/.]$/.test(expression)) {
            throw new Error("Perhitungan belum lengkap");
        }

        // Mengubah angka persen menjadi pembagian 100
        const safeExpression = expression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        const answer = Function(
            '"use strict"; return (' + safeExpression + ')'
        )();

        if (!Number.isFinite(answer)) {
            throw new Error("Hasil tidak valid");
        }

        history.textContent = expression
            .replace(/\*/g, "×")
            .replace(/\//g, "÷")
            + " =";

        expression = String(
            Number(answer.toPrecision(12))
        );

        finished = true;
        updateDisplay();

    } catch (error) {
        history.textContent = "Perhitungan tidak valid";
        result.value = "Error";
        expression = "";
        finished = false;
    }
}

// Menangani klik tombol kalkulator
buttons.addEventListener("click", function (event) {
    const button = event.target.closest("button");

    if (!button) return;

    const value = button.dataset.value;
    const action = button.dataset.action;

    // Menghapus semua angka
    if (action === "clear") {
        expression = "";
        history.textContent = "";
        finished = false;
        updateDisplay();
        return;
    }

    // Menghapus satu karakter terakhir
    if (action === "delete") {
        if (finished) {
            expression = "";
            finished = false;
        } else {
            expression = expression.slice(0, -1);
        }

        updateDisplay();
        return;
    }

    // Mengubah tanda positif dan negatif
    if (action === "sign") {
        if (!expression) return;

        try {
            const current = Function(
                '"use strict"; return (' +
                expression.replace(
                    /(\d+(?:\.\d+)?)%/g,
                    "($1/100)"
                ) + ')'
            )();

            if (Number.isFinite(current)) {
                expression = String(-current);
                finished = true;
                updateDisplay();
            }
        } catch (error) {
            history.textContent = "Periksa perhitungan";
        }

        return;
    }

    // Menjalankan perhitungan
    if (action === "calculate") {
        calculate();
        return;
    }

    if (value === undefined) return;

    // Memulai angka baru setelah hasil keluar
    if (finished) {
        if (/[0-9.]/.test(value)) {
            expression = "";
        }

        finished = false;
    }

    // Mengganti operator jika operator ditekan berurutan
    if (
        /[+\-*/%]/.test(value) &&
        /[+\-*/%]$/.test(expression)
    ) {
        expression = expression.slice(0, -1);
    }

    // Mencegah dua titik desimal dalam satu angka
    if (value === ".") {
        const lastNumber = expression.split(/[+\-*/%]/).pop();

        if (lastNumber.includes(".")) return;

        if (!lastNumber) {
            expression += "0";
        }
    }

    expression += value;
    updateDisplay();
});

// Mendukung penggunaan keyboard
document.addEventListener("keydown", function (event) {
    if (/^[0-9.+*/%-]$/.test(event.key)) {
        event.preventDefault();

        const button = buttons.querySelector(
            `[data-value="${event.key}"]`
        );

        if (button) button.click();
    }

    if (event.key === "Enter") {
        event.preventDefault();
        buttons.querySelector(
            '[data-action="calculate"]'
        ).click();
    }

    if (event.key === "Backspace") {
        buttons.querySelector(
            '[data-action="delete"]'
        ).click();
    }

    if (event.key === "Escape") {
        buttons.querySelector(
            '[data-action="clear"]'
        ).click();
    }
});

