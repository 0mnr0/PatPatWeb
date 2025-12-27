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
		log(TranslateAssistant.defaultLocale())
		log(TranslateAssistant.isLangAvailable(navigator.language) ? navigator.language : 'en')
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
				
				<div class="SettingLine">
					${GetSwitch('ShowImages')} 
					<p data-i18n="ShowHandDescription"></p>
				</div>
				
				
			</div>
				
		
		`
		
	}
	
	// ShowHand
	// Hand Skins
	// PatExtensions
	
	document.runSettingBing();
})()


const runPatSound = async function() {
	let audio = new Audio(BrowserContext.runtime.getURL("etc/sounds/pat0.ogg"));
	audio.volume = (await Settings.get('PatVolume', 0.5))/100;
	audio.play();
}