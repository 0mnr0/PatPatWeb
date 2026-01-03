const TriggerKey = isFireFox ? "Alt" : "Shift";

const patListening = [];	
const PatStrength = 0.25;

const PattingRightNow = new Set();
let IsDataPack = false;
let UserSettings = {};
let LoadedPack = null;
let patFiles = []; // png sequence will be loaded here
let patSounds = []; // ogg sequence will be loaded heere

async function loadPacks() {
	UserSettings = await Settings.getAll();
    const url = BrowserContext.runtime.getURL("etc/packs.json");
    const response = await fetch(url);
    return await response.json()
}





const loadPackData = async function() {
	let PackName = await Settings.get('SelectedPack', 'PatPat Classic');
	let BuiltinPacks = await loadPacks();
	IsDataPack = PackName === "@DataPack";
	LoadedPack = BuiltinPacks[PackName];
	
	
	if (IsDataPack) { LoadedPack = await Settings.get('@DataPack', null) }
	
	if (LoadedPack === undefined) {
		alert(`Мы не можем подключить набор ресурсов "${PackName}" в PatPat :(. Выберите другой`);
		return
	}
	patFiles = [];
	patSounds = [];
	const Loaders = ["sequence", "sounds"];
	
	
	
	for (let loader of Loaders) {
		let LOADINGThing = LoadedPack[loader];
		for (let thing of LOADINGThing) {
			let path = IsDataPack ? thing : BrowserContext.runtime.getURL(`etc/${LoadedPack.PackPlace}/${thing}`);
			
			if (loader==="sequence") { 
				patFiles.push(path);
			} else {
				patSounds.push(path);
			}
		}
	}
	preloadImages();
}
loadPackData();


function preloadImages() {
	return Promise.all(
		patFiles.map(url => new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(url);
			img.onerror = reject;
			img.src = url;
		}))
	);
}; 


async function playBase64Audio(base64String, {volume = 1.0, muted = false} = {}) {
	const isMuted = !UserSettings.AllowSound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const base64Data = base64String.split(';base64,')[1] || base64String;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    try {
        const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        const gainNode = audioContext.createGain();
        gainNode.gain.value = isMuted ? 0 : getVolume();
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start();
        return { audioContext, source, gainNode };
    } catch (e) {
        console.error("Failed to decode audio:", e);
    }
}

function getVolume() {
	return Number(UserSettings.PatVolume)/100
}

function getAnimationSpeed() {
	const Speed = UserSettings.PatSpeed;
	if (Speed === undefined || Speed === null) {return 1;}
	return Speed;
	
	
	// IF I EVER NEED REVERSE ALGHORYTM:
	if (Speed > 1) {
		
		// for example [1.25]: We Should Speed Up AnEimation
		const Difference = 1 - Speed; // 1 - 1.25  -->  -0.25
		return Speed - Difference; // --> 0.75 
		
	} else {
		// for example [0.75]: We Should Slow Up Animation
		const Difference = 1 - Speed; // 1 - 0.75  -->  0.25
		return Speed + Difference; // --> 1.25 
	}
}

async function runPatAnimation(element, isAutoClicked, scaleWas) {
	if (!LoadedPack || PattingRightNow.has(element)) return;
	if (patListening.includes(element.parentElement)) {return}
	
	let origScale = Attribute.get(element, 'scale', '');
	let origScaleData = Attribute.getScale(element); // {"XScale": 1, "YScale": 1}
	
	let origTransition = Attribute.get(element, 'transition', 'all');
	let origTransformOrigin = Attribute.get(element, 'transform', '');
	let origPointerEvents = Attribute.get(element, 'pointer-events', 'auto');
	
	let newYScale = null;
	if (origScaleData.YScale) {newYScale = parseFloat(origScaleData.YScale)-PatStrength} else {newYScale = 1 - PatStrength};
	let scaleStringRule = `scale ${(LoadedPack.animLength/2)/1000}s`;
	
	element.style.transition = origTransition + (origTransition.includes(scaleStringRule) ? '' : ', '+scaleStringRule);
	element.style.scale = origScaleData.XScale+' '+newYScale;
	element.style.transformOrigin = 'bottom';
	element.style.pointerEvents = 'none';
	
	
	let overlay = UserSettings.ShowImages ? addOverlay(element) : null;
	PattingRightNow.add(element);
	
	window.getSelection().removeAllRanges();
	let goBackAnim = false;
	
	if (IsDataPack) {
		playBase64Audio(randChoose(patSounds))
	} else {
		let Sound = new Audio(randChoose(patSounds)); 
		Sound.muted = !UserSettings.AllowSound;
		Sound.volume = getVolume();
		Sound.play();
	}
	
	
	for (let i = 0; i < patFiles.length; i++) {
		const pat = patFiles[i];
		if (overlay) { overlay.src = pat; }
		
		
		
		if (i>=(patFiles.length/2) && !goBackAnim) { //start animate scale backwards
			goBackAnim = true;
			element.style.scale = (scaleWas !== undefined) ? scaleWas : origScale;
		}
		await sleep(LoadedPack.animLength/patFiles.length*getAnimationSpeed());
	}


		
	if (overlay) { overlay.remove(); }
	element.style.pointerEvents = origPointerEvents;
	element.style.transformOrigin = origTransformOrigin;
	PattingRightNow.delete(element);
	
	if (nextPat) {
		if (scaleWas !== undefined) { await runPatAnimation(nextPat, true, scaleWas); return}
		else { await runPatAnimation(nextPat, true, origScale); return }
	} 
	
	else if (isAutoClicked) {
		element.style.scale = scaleWas
	}
}

function randChoose(array) {return array[Math.floor(Math.random()*array.length)]}

function addOverlay(target) {
	const rect = target.getBoundingClientRect();
	let leftPos = rect.left + window.scrollX;
	let topPos = rect.top + window.scrollY;
	if (LoadedPack.XPosMultiplier) { leftPos = leftPos + (rect.width * LoadedPack.XPosMultiplier) }
	if (LoadedPack.YPosMultiplier) { topPos = topPos + (rect.height * LoadedPack.YPosMultiplier) }

	const overlay = document.createElement('img');
	overlay.className = 'patClassAnimation';
	overlay.style.left = leftPos +'px';
	overlay.style.top = topPos + 'px';
	overlay.style.width = rect.width + 'px';
	overlay.style.height = rect.height + 'px';
	overlay.src = patFiles[0];
	document.body.after(overlay);
	return overlay;
}


if (isFireFox) {
	document.addEventListener("contextmenu", e => {
		if (allowPatKeyPressed) {
			e.preventDefault();
			e.stopPropagation();
		}
	}, true);
} else {
	window.addEventListener('contextmenu', (e) => {
		if (allowPatKeyPressed) e.preventDefault();
	}, true);
}




chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "PatPat.events.SettingsChange") {
	  await loadPackData();
  }
});
