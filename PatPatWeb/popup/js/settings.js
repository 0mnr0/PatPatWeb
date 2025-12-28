const Settings = {
	  get(key, defValue) {
		return new Promise(resolve => {
		  chrome.storage.local.get(key, res => {
			if (res[key] === undefined) {resolve(defValue); return}
			resolve(res[key]);
		  });
		});
	  },

	  set(key, value) {
		return new Promise(resolve => {
		  chrome.storage.local.set({ [key]: value }, resolve);
		});
	  },

	  delete(key) {
		return new Promise(resolve => {
		  chrome.storage.local.remove(key, resolve);
		});
	  },

	  clear() {
		return new Promise(resolve => {
		  chrome.storage.local.clear(resolve);
		});
	  },

	  async isKeyExists(key) {
		return new Promise(resolve => {
		  chrome.storage.local.get(key, res => {
			resolve(Object.prototype.hasOwnProperty.call(res, key));
		  });
		});
	  },
	  
	  getAll() {
		return new Promise(resolve => {
		  chrome.storage.local.get(null, res => {
			resolve(res);
		  });
		});
	  } 
	};




const findInput = (settingName) => {
	find(`input[SettingName="${settingName}"]`).click()
}

(async() => {
	UserSettings = await Settings.getAll();

	window.GenerateSettingsCode = async () => {
		function GetSwitch(settingName) {
			const isEnabled = UserSettings[settingName];
			return `
			<label class="toggle-switch">
				<input SettingName="${settingName}" type="checkbox" ${isEnabled ? 'checked' : ''}/>
				<span class="slider"></span>
			</label>
			<h2 data-i18n="${settingName}"></h2>
			`
		}
		return `
			<div class="SettingSection General">
				<div class="SettingLine">
					${GetSwitch('AllowSound')} 
					<div class="inlineSetting">
						<label for="volume" data-i18n="PatVolume"></label>
						<input type="range" style="width: 100%" id="volume" min="0" max="100" value="${await Settings.get('PatVolume', 0)}" SettingName="PatVolume" updatetext="y">
						<label for="volume"> (${await Settings.get('PatVolume', 0)}%) </label>
					</div>
				</div>
				
				<div class="SettingLine">
					${GetSwitch('ShowImages')} 
					<p data-i18n="ShowImagesDescription"></p>
				</div>
			</div>
			
			
			
			
			<div class="SettingSection PatPatPacks Chosen">
				
				<div class="UploadPack DataPack SettingLine">
				
				
					<label for="zipUploader" class="zipUpload" data-i18n="UploadDatapack">
						Choose DataPack
					</label>
					<input id="zipUploader" type="file" accept=".zip"/>
					<lavel for="zipUploader" class="DataPackDescription" data-i18n="DataPackDescription"></span>


				<div>
				
			</div>
				
		
		`
		
	}
	
	// Animation Speed
	// ShowHand
	// Hand Skins
	
	document.runSettingBing();
})()


const runPatSound = async function() {
	let SoundPlace = 'etc/'+LoadedPack.PackPlace+'/'+LoadedPack.sounds[0];
	if (IsDataPack) {
		SoundPlace = LoadedPack.sounds[0]
	}
	
	if (IsDataPack) {
		playBase64Audio(SoundPlace)
	} else {
		let audio = new Audio(BrowserContext.runtime.getURL(SoundPlace));
		audio.volume = getVolume();
		audio.play();
	}
}


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