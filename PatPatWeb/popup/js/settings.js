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

const GetDatapackData = () => {
	return UserSettings["@DataPack"];
}


const GetDatapack = {
	Images: () => {
		let data = GetDatapackData();
		if (!data) {return []};
	
		let HTMLCode = ''
		for (imgCode of data.sequence) {
			HTMLCode += `
				<img src="${imgCode}">
			`
		}; return HTMLCode
		
	},
	ImagesNum: () => {
		let data = GetDatapackData();
		if (!data) {return 0;} else {return data.sequence.length}
	},
	SoundsNum: () => {
		let data = GetDatapackData();
		if (!data) {return 0;} else {return data.sounds.length}
	},
	AnimationLen: () => {
		let data = GetDatapackData();
		if (!data) {return 0;} else {return data.animLength}
	},
	FirstImage: () => {
		let data = GetDatapackData();
		return data.sequence[0]
	}
};

const BuildPack = {
	Images: (name) => {
		let data = BuiltinPacks[name];
		if (!data) {return []};
	
		let HTMLCode = ''
		for (imgCode of data.sequence) {
			HTMLCode += `
				<img src="${BrowserContext.runtime.getURL(`etc/${data.PackPlace}/${imgCode}`)}">
			`
		}; return HTMLCode
		
	},
	ImagesNum: (name) => {
		let data = BuiltinPacks[name];
		if (!data) {return 0;} else {return data.sequence.length}
	},
	SoundsNum: (name) => {
		let data = BuiltinPacks[name];
		if (!data) {return 0;} else {return data.sounds.length}
	},
	AnimationLen: (name) => {
		let data = BuiltinPacks[name];
		if (!data) {return 0;} else {return data.animLength}
	},
	FirstImage: (name) => {
		let data = BuiltinPacks[name];
		return BrowserContext.runtime.getURL(`etc/${data.PackPlace}/${data.sequence[0]}`)
	},
	GetAuthor: (name) => {
		let data = BuiltinPacks[name];
		if (!data) {return ''}
		let author = data.author; if (!author) {return ''}
		return author
	}
};


const GenerateDataPackLists = () => {
	let code = '';
	for (DataPackName of Object.keys(BuiltinPacks)) {
		const DataPack = BuiltinPacks[DataPackName];
		
		code += `
			<div class="AvailableDataPack" packname="${DataPackName}">
				<div class="FullWidthpreview">
					<img src="${BuildPack.FirstImage(DataPackName)}"</img>
				</div>
				<div class="PreviewData">
					<span class="packName"> ${DataPackName} </span>
					<div class="ImagePreview"> ${BuildPack.Images(DataPackName)} </div>
				</div>
							
				<div class="PreviewData TextType">
					<span data-i18n="howmanysounds"> Sounds: <span>${BuildPack.SoundsNum(DataPackName)} | </span> <span data-i18n="howmanyimages"> Images: <span>${BuildPack.ImagesNum(DataPackName)}</span> </span> </span>
					<span data-i18n="howlong"> Length: <span>${BuildPack.AnimationLen(DataPackName)}ms</span></span>
					<span data-i18n="PackAuthor" class="PackAuthor"> Author: <span> ${BuildPack.GetAuthor(DataPackName)}<span></span>
				</div>
			</div>
		`
	}
	return code;
	
}


const RegisterPacksAnimations = () => {
	findAll('.AvailableDataPack').forEach(async (pack) => {
		const packName = pack.getAttribute('packname');
		let PackData = null;
		let PackIsLoaded = false;
		if (packName === '@DataPack') {PackData = GetDatapackData(); PackIsLoaded=true;} else {
			PackData = BuiltinPacks[packName]
		}
		const previewPlace = pack.find('.FullWidthpreview img');
		
		let currentImage = 0;
		let pngTime = (PackData.animLength / PackData.sequence.length) * 2; // to prevent too fast anims
		
		
		while (true) {
			let img = '';
			if (PackIsLoaded) {
				img = PackData.sequence[currentImage]
			} else {
				img = `${BrowserContext.runtime.getURL(`etc/${PackData.PackPlace}/${PackData.sequence[currentImage]}`)}`
			}
			
			previewPlace.src = img;
			currentImage++;
			if (currentImage >= PackData.sequence.length) {
				currentImage = 0;
				await sleep(pngTime);
			}
			await sleep(pngTime > 10 ? pngTime : 10); // "0ms" potential fix
		}
	})
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
			<div class="SettingSection General Chosen">
				<div class="SettingLine">
					${GetSwitch('AllowSound')} 
					<div class="inlineSetting">
						<label for="volume" data-i18n="PatVolume"></label>
						<input type="range" style="width: 100%" id="volume" min="0" max="100" value="${await Settings.get('PatVolume', 0)}" SettingName="PatVolume" updatetext="y">
						<label for="volume" class="Percentage"> (${await Settings.get('PatVolume', 0)}%) </label>
					</div>
				</div>
				
				<div class="SettingLine">
					<h2 data-i18n="PatSpeed"></h2>
					<div class="inlineSetting volumer">
						<input type="range" id="PatSpeedValue" min="0.75" max="1.75" step="0.01" value="${await Settings.get('PatSpeed', 1)}" SettingName="PatSpeed" updatetext="y">
						<label for="PatSpeedValue" class="Percentage"> ${Math.round(await Settings.get('PatSpeed', 1)*100)}% </label>
					</div>
				</div>
				
				
				<div class="SettingLine">
					${GetSwitch('ShowImages')} 
					<p data-i18n="ShowImagesDescription"></p>
				</div>
				
				<div class="SettingLine">
					${GetSwitch('MakeAnnouncements.Ext')} 
					<p data-i18n="MakeAnnouncements.Ext.Desc"></p>
				</div>
			</div>
			
			
			
			
			<div class="SettingSection PatPatPacks">
				<div class="UploadPack DataPack SettingLine">
				
				
					<label for="zipUploader" class="zipUpload" data-i18n="UploadDatapack">
						Choose DataPack
					</label>
					<input id="zipUploader" type="file" accept=".zip"/>
					<label for="zipUploader" class="DataPackDescription" data-i18n="DataPackDescription"></label>
					${ Object.keys(UserSettings).includes("@DataPack") ? 
					
						`
						<div class="removeSavedDataPack">
							<img src="icons/delete.svg">
							<span data-i18n="delete"></span>
						</div>
						<div class="AvailableDataPack" packname="@DataPack">
							<div class="FullWidthpreview">
								<img src="${GetDatapack.FirstImage()}"</img>
							</div>
							<div class="PreviewData">
								<span class="packName"> Data Pack </span>
								<div class="ImagePreview"> ${GetDatapack.Images()} </div>
								
								
							</div>
							
							<div class="PreviewData TextType">
								<span data-i18n="howmanysounds"> Sounds: <span>${GetDatapack.SoundsNum()} | </span> <span data-i18n="howmanyimages"> Images: <span>${GetDatapack.ImagesNum()}</span> </span> </span>
								<span data-i18n="howlong"> Length: <span>${GetDatapack.AnimationLen()}ms</span></span>
							</div>
							
						</div>
						`	
					: ''}
				</div>
				<div class="CookedPacksList">
					${GenerateDataPackLists()}
				</div>
				
			</div>
			
			
			<div class="SettingSection BlockList">
				<h2 class="BlockListDesc" data-i18n="BlockListSetting"></h2> 
				
				<div class="flex inputBar">
					<input type="text" autocomplete="off" placeholder="example.com" id="BlockListInputBar"></input>
					<img class="add" alt="Add Element" src="icons/add.svg">
				</div>
				
				<div class="list"></div>
			</div>
			
			
			<div class="SettingSection AuthorsTab">
				<h2 class="AuthorsTab" data-i18n="AuthorsTab"></h2> 
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

const GetIgnoreSitesList = () => {
	let val = UserSettings.IgnoreSites;
	if (val === undefined || val === null) {
		return [];
	} else { return val }
}

const RegisterBlockListProcessor = () => {
	let BlockList = find('.SettingSection.BlockList div.list');
	
	let BlockListInput = find('.SettingSection.BlockList .inputBar input');
	let BlockListAddButton = find('.SettingSection.BlockList .inputBar img.add');
	
	let processedDomain = '';
	BlockListInput.addEventListener('input', (event) => {
		processedDomain = getCleanDomain(BlockListInput.value)
	});
	
	BlockListAddButton.onclick = async () => {
		if (!processedDomain.includes('.')) {
			// if site doamin doest not have "." in domain   ->    abort
			Toast.create(
				TranslateAssistant.translate.get('SpecifyCorrectDomainName'),
				3000,
				"OK",
			);
			return;
			
		} else if (GetIgnoreSitesList().includes(processedDomain)) {
			// if site doamin already ignoring
			Toast.create(
				TranslateAssistant.translate.get('SiteIsAlreadyIgnoring'),
				3000,
				"OK",
			);
			return;
		} else {
			let newIgnoreList = GetIgnoreSitesList();
			newIgnoreList.push(processedDomain);
			await Settings.set('IgnoreSites', newIgnoreList);
			AddIntoIgnoreList(BlockList, processedDomain);
			UserSettings.IgnoreSites = newIgnoreList;
			BlockListInput.value = '';
			Toast.create(
				TranslateAssistant.translate.get('BlockList.ReloadPageToApply'),
				3000
			);
		}
	};
	
	for (domain of GetIgnoreSitesList()) {
		AddIntoIgnoreList(BlockList, domain);
	}
}

const AddIntoIgnoreList = (main, domainName) => {
	let domainDiv = createElementWith('div', {});
	domainDiv.className = 'domainDiv';
	
	domainDiv.innerHTML = `
		<img class="preview" src="https://www.google.com/s2/favicons?sz=128&domain=${domainName}">
		<span class="domainName">${domainName}</span>
		<img class="delete" src="icons/delete.svg">
	`;
	main.appendChild(domainDiv);
	
	
	domainDiv.find('img.delete').onclick = async () => {
		let newIgnoreList = GetIgnoreSitesList().filter(item => item !== domainName)		
		await Settings.set('IgnoreSites', newIgnoreList);
		UserSettings.IgnoreSites = newIgnoreList;
		domainDiv.remove();
		Toast.create(
			TranslateAssistant.translate.get('BlockList.ReloadPageToApply'),
			3000
		);
	}
}