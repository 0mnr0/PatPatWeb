let allowPatKeyPressed = false;
const PatAllowTriggerKey = isFireFox ? "Control" : "Shift"; //shift on firefox is force-showing contextmenu

window.addEventListener("keydown", e => { if (e.key === PatAllowTriggerKey) allowPatKeyPressed = true; });
window.addEventListener("keyup", e => { if (e.key === PatAllowTriggerKey) allowPatKeyPressed = false; });
SupportedElements = ['img', 'svg']



let nextPat = null;
function runPatInit() {
	let rules = GetSiteRuleSet(window.location.hostname); if (rules.length > 0) {rules = ", "+rules}
	
	findAll('body '+(SupportedElements.join())+rules).forEach(element => {
		if (patListening.includes(element) || element.className === 'patClassAnimation') {return}
		patListening.push(element)
		
		element.tabIndex = 0;
		element.addEventListener("mousedown", e => {
			if (e.button === 2 && allowPatKeyPressed) {
				e.preventDefault();
				
			}
		});
		element.addEventListener("contextmenu", e => { if(allowPatKeyPressed) { e.preventDefault(); e.stopPropagation(); }});
		
		
		
		let rightMouseDownOnElement = false;
		element.addEventListener('mousedown', (e) => {
		    if (e.button === 2) {
				nextPat = element;
				rightMouseDownOnElement = true;
				if(allowPatKeyPressed) { runPatAnimation(element); e.preventDefault() }
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