(function() {
    const avatar = document.getElementsByClassName('avatar')[0];
    const STICKY_CLASS = 'avatar--sticky';
    let avatarMidPoint = null;

    function onResize() {
        avatarMidPoint = null;
    }

    function onScroll() {
        if (!avatarMidPoint) {
            avatarMidPoint = avatar.offsetTop + (avatar.offsetHeight / 2);
        }
        if (window.scrollY > avatarMidPoint) {
            avatar.classList.add(STICKY_CLASS);
        } else {
            avatar.classList.remove(STICKY_CLASS);
        }
    }

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll);
}());