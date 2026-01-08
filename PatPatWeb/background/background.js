const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
const BrowserContext = isFirefox ? browser : chrome;
const ExtensionVersion = BrowserContext.runtime.getManifest().version;
const log = console.log;


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



async function loadPacks() {
  const url = chrome.runtime.getURL("etc/packs.json");
  const response = await fetch(url);
  const data = await response.json();
  return data
}

const DefaultValues = {
	SelectedPack: "PatPat Classic",
	ShowImages: true,
	AllowSound: true,
	PatSpeed: 1,
	PatVolume: 50,
	IgnoreSites: [],
	"MakeAnnouncements.Ext": true
};

















async function SetupDefault () {
	const BuiltinPacks = await loadPacks();
	const UserSettings = await Settings.getAll();
	
	const DefaultValuesKeys = Object.keys(DefaultValues);
	for (let i = 0; i < DefaultValuesKeys.length; i++) {
		const key = DefaultValuesKeys[i]
		if (await Settings.isKeyExists(key) === false) {
			await Settings.set(key, DefaultValues[key])
		}
	}
	
}
SetupDefault();





chrome.storage.onChanged.addListener(async (changes) => {
  const tabs = await chrome.tabs.query({});
  await SetupDefault();
  
  
  for (const tab of tabs) {
    if (!tab.id) {log('p!'); };

    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: "PatPat.events.SettingsChange"
      });
    } catch(e) {
		log(e)
    }
  }
});

