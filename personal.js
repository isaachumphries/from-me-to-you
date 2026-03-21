function inc() {
    c = (c >= 10) ? 0 : c + 1; 
    update();
}

function dec() {
    c = c > 0 ? c - 1 : 0; 
    update();
}

function update() { 
    count.textContent = c;     
}
