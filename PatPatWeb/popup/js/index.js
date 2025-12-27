const BrowserContext = (typeof chrome === 'object') ? chrome : browser;
const SettingsPane = find('.settingsPane');
let UserSettings = {};






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
			el.addEventListener('input', () => {
				if (SetName) {
					NewValue = Number(el.value)
					Settings.set(SetName, NewValue);

					const RangeTextValue = el.nextElementSibling;
					if (RangeTextValue) {RangeTextValue.textContent = `${NewValue}%`}
				}
			});
		if (SetName === 'PatVolume') {
			el.addEventListener('change', runPatSound)
		}
		});
	}
	
	
})()