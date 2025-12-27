let shiftPressed = false;
window.addEventListener("keydown", e => { if (e.key === "Shift") shiftPressed = true; });
window.addEventListener("keyup", e => { if (e.key === "Shift") shiftPressed = false; });



let nextPat = null;
function runPatInit() {
	findAll('body '+(SupportedElements.join())).forEach(element => {
		if (patListening.includes(element) || element.className === 'patClassAnimation') {return}
		patListening.push(element)
		
		element.tabIndex = 0;
		element.addEventListener("mousedown", e => {
			if (e.button === 2 && shiftPressed) {
				e.preventDefault();
				runPatAnimation(element);
			}
		});
		element.addEventListener("contextmenu", e => { if(shiftPressed) { e.preventDefault() }});
		
		
		
		let rightMouseDownOnElement = false;
		element.addEventListener('mousedown', (e) => {
		    if (e.button === 2) {
				nextPat = element;
				rightMouseDownOnElement = true;
				if(shiftPressed) { e.preventDefault() }
		    }
		});

		document.addEventListener('mouseup', (e) => {
		  if (e.button === 2 && rightMouseDownOnElement) {
			rightMouseDownOnElement = false;
			nextPat = null;
		  }
		});

	})
}



let isPaused = false;
let needsUpdate = false;
const THROTTLE_MS = 200;

function throttledRunPatInit() {
  if (isPaused) {
    needsUpdate = true;
    return;
  }

  runPatInit();
  isPaused = true;
  setTimeout(() => {
    isPaused = false;

    if (needsUpdate) {
      needsUpdate = false;
      throttledRunPatInit();
    }
  }, THROTTLE_MS);

}

const observer = new MutationObserver((mutations) => {
    throttledRunPatInit();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false
});


let patStyle = document.createElement('style');
patStyle.textContent = `
	.patClassAnimation {
		position: absolute;
		pointer-events: none;
		z-index: 999999999999;
		object-fit: contain;
		border: none; 
		outline: none;
		background-position: center;
	}
`
document.head.appendChild(patStyle);












