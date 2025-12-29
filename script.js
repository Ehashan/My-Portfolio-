/*  MENU TOGGLE  */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

/*  SCROLL SECTIONS ACTIVE LINK  */
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                document
                    .querySelector('header nav a[href*=' + id + ']')
                    ?.classList.add('active');
            });
        }
    });

    /*  STICKY HEADER  */
    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    /*  REMOVE MENU ON SCROLL  */
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

/* SCROLL REVEAL  */
ScrollReveal({
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .service-container, .portfolio-box, .contact', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

/*  TYPED JS  */
const typed = new Typed('.multiple-text', {
    strings: ['Freelancer', 'Designer', 'Web/Software Developer'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 100,
    loop: true
});

/*  EMAILJS CONTACT FORM */
(function () {
    emailjs.init("qf80UU9PGUtbKiHTb"); //  Public Key
})();

const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        emailjs.sendForm(
            "service_vwnlvi9",      //  Service ID
            "template_yk2kbte",     //  Template ID
            this
        ).then(
            () => {
                alert("Message sent successfully!");
                contactForm.reset();
            },
            (error) => {
                alert("Failed to send message. Try again.");
                console.error("EmailJS Error:", error);
            }
        );
    });
}
