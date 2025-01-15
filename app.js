// Menampilkan pesan selamat datang di konsol
console.log("Selamat datang di HorseTech Production!");

// Fungsi untuk menampilkan alert saat tombol diklik
function showAlert() {
    alert("Terima kasih sudah mengunjungi website kami!");
}

// Menambahkan event listener ke link atau tombol
document.addEventListener("DOMContentLoaded", function () {
    const button = document.querySelector("#contactButton");
    if (button) {
        button.addEventListener("click", showAlert);
    }
});