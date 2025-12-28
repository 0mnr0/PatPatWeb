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
					NewValue = Number(el.value)
					await Settings.set(SetName, NewValue);
					const RangeTextValue = el.nextElementSibling;
					loadPackData();
					if (RangeTextValue) {RangeTextValue.textContent = `${NewValue}%`}
				}
			});
			
			if (SetName === 'PatVolume') {
				el.addEventListener('change', runPatSound)
			}
		});
		
		
		function ClearAllSettingTypes() {
			findAll('div.SettingsDiv div.leftPane > div').forEach(settingType => { settingType.classList.remove('active'); })
		}
		findAll('div.SettingsDiv div.leftPane > div').forEach(settingType => {
			
			settingType.onclick = () => {
				ClearAllSettingTypes();
				findAll('div.SettingSection').forEach(SettingDisplayingType => {
					SettingDisplayingType.style.display = 'none';
				});
				let CurrentSetting = find(`div.SettingSection.${settingType.getAttribute('SettingLinkedTo')}`);
				if (!CurrentSetting) {warn('Setting Div is not found :('); return}
				CurrentSetting.style.display='';
				CurrentSetting.classList.add('Chosen');
				settingType.classList.add('active');
			}
		})
		
		
		
		const DataPackFileText = find('label.zipUpload');
		const DataPackFileInput = find('input#zipUploader');
		
		let lastTimeout = null;
		DataPackFileInput.addEventListener("change", async e => {
			clearTimeout(lastTimeout)
			if (!e.target.files[0]) {return}
			DataPackFileInput.disabled = true;
			
		    DataPackFileText.textContent = TranslateAssistant.translate.get('DataPackProcessing');
		    let result = await unpackData(e.target.files[0]);
			if (result.status !== 'ok') {
				DataPackFileText.classList.add('failed');
			} else {
				DataPackFileText.classList.remove('failed');
			}
			DataPackFileText.textContent = TranslateAssistant.translate.get(result.reason);
			
			lastTimeout = setTimeout(() => {
				DataPackFileText.textContent = TranslateAssistant.translate.get('UploadDatapack');
				DataPackFileText.classList.remove('failed');
				DataPackFileInput.disabled = false;
			}, 5000)
		});

		
	}
	
	
})()