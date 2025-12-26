const TriggerKey = isFireFox ? "Alt" : "Shift";

const patListening = [];
const PatAll = false;

const SupportedElements = 
	PatAll ? ['span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'svg', 'video', 'button']
	: ['img', 'svg'];
	
const PatStrength = 0.25;
const PatAnimationLength = 140;

const PattingRightNow = new Set();
const patFiles = [
	BrowserContext.runtime.getURL("etc/hand/pat0.png"),
	BrowserContext.runtime.getURL("etc/hand/pat1.png"),
	BrowserContext.runtime.getURL("etc/hand/pat2.png"),
	BrowserContext.runtime.getURL("etc/hand/pat3.png"),
	BrowserContext.runtime.getURL("etc/hand/pat4.png")
];
const patSounds = [
	BrowserContext.runtime.getURL("etc/sounds/pat0.ogg"),
	BrowserContext.runtime.getURL("etc/sounds/pat1.ogg"),
	BrowserContext.runtime.getURL("etc/sounds/pat2.ogg")
];



function preloadImages() {
	return Promise.all(
		patFiles.map(url => new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(url);
			img.onerror = reject;
			img.src = url;
		}))
	);
}; preloadImages();


async function runPatAnimation(element) {
	if (PattingRightNow.has(element)) return;
	if (SupportedElements.includes(element.parentElement.nodeName.toLowerCase())) {return}
	
	let origScale = Attribute.get(element, 'scale', '');
	let origScaleData = Attribute.getScale(element); // {"XScale": 1, "YScale": 1}
	
	let origTransition = Attribute.get(element, 'transition', 'all');
	let origTransformOrigin = Attribute.get(element, 'transform', '');
	let origPointerEvents = Attribute.get(element, 'pointer-events', 'auto');
	
	let newYScale = null;
	if (origScaleData.YScale) {newYScale = parseFloat(origScaleData.YScale)-PatStrength} else {newYScale = 1 - PatStrength};
	let scaleStringRule = `scale ${(PatAnimationLength/2)/1000}s`;
	
	element.style.transition = origTransition + (origTransition.includes(scaleStringRule) ? '' : ', '+scaleStringRule);
	element.style.scale = origScaleData.XScale+' '+newYScale;
	element.style.transformOrigin = 'bottom';
	element.style.pointerEvents = 'none';
	
	
	let overlay = addOverlay(element);
	PattingRightNow.add(element);
	
	window.getSelection().removeAllRanges();
	let goBackAnim = false;
	new Audio(randChoose(patSounds)).play();
	
	
	for (let i = 0; i < patFiles.length; i++) {
		const pat = patFiles[i];
		overlay.src = pat;
		
		
		
		if (i>(patFiles.length/2) && !goBackAnim) { //start animate scale backwards
			goBackAnim = true;
			element.style.scale = origScale;
		}
		await sleep(PatAnimationLength/patFiles.length);
	}
	await sleep(PatAnimationLength/patFiles.length);

	overlay.remove();
	element.style.pointerEvents = origPointerEvents;
	element.style.transformOrigin = origTransformOrigin;
	PattingRightNow.delete(element);
	if (nextPat) {
		runPatAnimation(nextPat);
	}
	
	
}

function randChoose(array) {return array[Math.floor(Math.random()*array.length)]}

function addOverlay(target) {
	const rect = target.getBoundingClientRect();

	const overlay = document.createElement('img');
	overlay.className = 'patClassAnimation';
	overlay.style.left = rect.left + window.scrollX + 'px';
	overlay.style.top = rect.top + window.scrollY + 'px';
	overlay.style.width = rect.width + 'px';
	overlay.style.height = rect.height + 'px';
	overlay.src = patFiles[0];
	document.body.after(overlay);
	return overlay;
}




document.addEventListener("contextmenu", e => {
	if (e.shiftKey) {
		e.preventDefault();
	}
}, true);