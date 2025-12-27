const DICT = {
	'en': {
		'GeneralSettings': "General Settings",
		'BlackList': "Black List",
		'AllowSound': 'Allow sounds',
		'PatVolume': 'Volume: ',
		'ShowImages': 'Show Image',
		'ShowImagesDescription': 'Specify whether to show images (Default is Hand)',
	},
	'ru': {
		'GeneralSettings': "Настройки",
		'BlackList': "Черный список",
		'AllowSound': 'Разрешить звуки',
		'PatVolume': 'Громкость: ',
		'ShowImages': 'Показывать изображение',
		'ShowImagesDescription': 'Укажите, стоит ли показывать изображения',
	},
	"by": "ru"
}



TranslateAssistant.init('en', DICT);
const lang = navigator.language;
const LoadLanguage =
  TranslateAssistant.isLangAvailable(lang) ? lang : 'en';

TranslateAssistant.defaultLocale(LoadLanguage);
