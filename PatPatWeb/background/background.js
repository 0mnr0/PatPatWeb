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
	PatVolume: 50
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







function canSendToTab(tab) {
  if (!tab?.id) return false;
  if (!tab.url) return false;

  if (
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("edge://") ||
    tab.url.startsWith("about:")
  ) return false;

  return true;
}


chrome.storage.onChanged.addListener(async (changes) => {
  const tabs = await chrome.tabs.query({});

  for (const tab of tabs) {
    if (!canSendToTab(tab)) continue;

    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: "SettingsChange"
      });
    } catch {
    }
  }
});

