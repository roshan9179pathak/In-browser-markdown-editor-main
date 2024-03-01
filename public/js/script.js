const setHeight = () => {
    const currentHeight = window.innerHeight;
    document.body.style.height = `${currentHeight}px`;
};
window.addEventListener("resize", setHeight);
setHeight();