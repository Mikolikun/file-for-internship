
let currentIndex = 0;

  function changeSlide(direction) {
    const wrapper = document.getElementById('wrapper');
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    // คำนวณตำแหน่งใหม่
    currentIndex += direction;

    // ถ้าเลื่อนไปเกินหน้าสุดท้าย ให้กลับไปหน้าแรก
    if (currentIndex >= totalSlides) {
      currentIndex = 0;
    }
    // ถ้าเลื่อนถอยหลังจากหน้าแรก ให้ไปหน้าสุดท้าย
    if (currentIndex < 0) {
      currentIndex = totalSlides - 1;
    }

    // สั่งให้เลื่อนด้วยการขยับแนวแกน X (เป็น % ของความกว้าง)
    const offset = -currentIndex * 100;
    wrapper.style.transform = `translateX(${offset}%)`;
  }
// ตั้งเวลาให้เลื่อนเองทุกๆ 3 วินาที (3000 มิลลิวินาที)
let autoSlide = setInterval(() => {
  changeSlide(1);
}, 3000);

// (Option) หยุดเลื่อนชั่วคราวเมื่อเอาเมาส์ไปวางที่สไลด์
const container = document.querySelector('.slider-container');

container.addEventListener('mouseenter', () => {
  clearInterval(autoSlide); // หยุดนับเวลา
});

container.addEventListener('mouseleave', () => {
  // เริ่มนับเวลาใหม่เมื่อเอาเมาส์ออก
  autoSlide = setInterval(() => {
    changeSlide(1);
  }, 3000);
});