const BrowserContext = (typeof chrome === 'object') ? chrome : browser;
const SettingsPane = find('.settingsPane');
let UserSettings = {};
let LoadedPack = null;
let patFiles = [];
let patSounds = [];
let BuiltinPacks = [];
let IsDataPack = false;


async function loadPacks() {
	UserSettings = await Settings.getAll();
    const url = BrowserContext.runtime.getURL("etc/packs.json");
    const response = await fetch(url);
    return await response.json()
}

async function loadPackData() {
	let PackName = await Settings.get('SelectedPack', 'PatPat Classic');
	BuiltinPacks = await loadPacks();
	LoadedPack = BuiltinPacks[PackName];
	IsDataPack = PackName === "@DataPack"
	if (IsDataPack) { LoadedPack = await Settings.get('@DataPack', null) }
	const Loaders = ["sequence", "sounds"];
	patFiles = [];
	patSounds = [];
	
	
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
}



function getVolume() {
	return Number(UserSettings.PatVolume)/100
}


(async () => {
	
	function GenerateSwitch(SettingName) {
		const isEnabled = false;
		return `
		<label class="toggle-switch">
			<input type="checkbox" ${isEnabled ? 'checked' : ''}/>
			<span class="slider"></span>
		</label>
		`
	}
	
	document.runSettingBing = async () => {
		await loadPackData();
		SettingsPane.innerHTML = await GenerateSettingsCode();
		TranslateAssistant.translate.all();
		
		
		
		SettingsPane.findAll('div.SettingLine h2').forEach(el => {
			el.onclick = () => {findInput(el.getAttribute('data-i18n'))}
		});
		
		SettingsPane.findAll('div.SettingLine input[type="checkbox"]').forEach(el => {
			el.onclick = () => {
				Settings.set(el.getAttribute('SettingName'), el.checked);
			}
		});
		
		SettingsPane.findAll('div.SettingLine input[type="range"]').forEach(el => {
			let SetName = el.getAttribute('SettingName');
			
			
			
			el.addEventListener('input', async () => {
				if (SetName) {
					let NewValue = Number(el.value);
					if (SetName === 'PatSpeed') {NewValue = Math.round(NewValue*100); if (NewValue>=98 && NewValue<=102) { el.value = 1; NewValue = 100;}}
					
					const RangeTextValue = el.nextElementSibling;
					if (RangeTextValue) {RangeTextValue.textContent = `${NewValue}%`}
				}
			});
			
			if (SetName === 'PatVolume') {
				el.addEventListener('change', async () => {
					let NewValue = Number(el.value)
					await Settings.set(SetName, NewValue);
					await loadPackData();
					runPatSound();
				})
			}
			
			if (SetName === 'PatSpeed') {
				el.addEventListener('change', async () => {
					let NewValue = Number(el.value)
					await Settings.set(SetName, NewValue);
					await loadPackData();
				})
			}
		});
		
		
		
		// Divides Switcher
			function ClearAllSettingTypes() {
				findAll('div.SettingsDiv div.leftPane > div').forEach(settingType => { settingType.classList.remove('active'); })
			}
			findAll('div.SettingsDiv div.leftPane > div').forEach(settingType => {
				
				settingType.onclick = () => {
					let newDivide = settingType.getAttribute('SettingLinkedTo')
					ClearAllSettingTypes();
					findAll('div.SettingSection').forEach(SettingDisplayingType => {
						SettingDisplayingType.style.display = 'none';
					});
					LocalStorage.save('LastSection', newDivide);
					let CurrentSetting = find(`div.SettingSection.${newDivide}`);
					if (!CurrentSetting) {warn('Setting Div is not found :('); return}
					CurrentSetting.style.display='';
					CurrentSetting.classList.add('Chosen');
					settingType.classList.add('active');
				}
			});
			const LastSectionOpened = LocalStorage.get('LastSection');
			if (LastSectionOpened) {find(`div[settinglinkedto="${LastSectionOpened}"]`).click()}
		
		
		
		
		const DataPackFileText = find('label.zipUpload');
		const DataPackFileInput = find('input#zipUploader');
		
		let lastTimeout = null;
		DataPackFileInput.addEventListener("change", async e => {
			clearTimeout(lastTimeout)
			if (!e.target.files[0]) {return}
			
		    DataPackFileText.textContent = TranslateAssistant.translate.get('DataPackProcessing');
		    let result = await unpackData(e.target.files[0]);
			if (result.status !== 'ok') {
				DataPackFileText.classList.add('failed');
			} else {
				DataPackFileText.classList.remove('failed');
				window.location.reload();
			}
			DataPackFileText.textContent = TranslateAssistant.translate.get(result.reason);
			
			lastTimeout = setTimeout(() => {
				DataPackFileText.textContent = TranslateAssistant.translate.get('UploadDatapack');
				DataPackFileText.classList.remove('failed');
			}, 5000)
		});
		
		
		findAll('.AvailableDataPack').forEach(pack => {
			pack.onclick = async () => {
				let NewPack = pack.getAttribute('packname');
				await Settings.set('SelectedPack', NewPack);
				window.location.reload();
			}
		});
		let ChosenPack = find(`.AvailableDataPack[packname="${await Settings.get('SelectedPack', 'PatPat Classic')}"]`);
		if (ChosenPack) {ChosenPack.classList.add('Active');}
		
		
		let RemovePack = find(`div.removeSavedDataPack`);
		if (RemovePack) {
			RemovePack.onclick = async () => {
				await Settings.set('SelectedPack', 'PatPat Classic')
				await Settings.delete('@DataPack');
				window.location.reload()
			}
		}
		
		RegisterPacksAnimations();
		RegisterBlackListProcessor();

		
	}
	
	
})()



const getCleanDomain = function(url) {
  try {
	  let checkUrl = url.startsWith('http://') || url.startsWith('https://') ? url : 'https://' + url;
	  
      let parsed = new URL(checkUrl);
      return parsed.hostname.replace(/^www\./, '').replaceAll("/","");
  } catch (e) {
      return null;
  }
}