const DICT = {
	'en': {
		'GeneralSettings': "General Settings",
		'BlockList': "Black List",
		'AllowSound': 'Allow sounds',
		'PatVolume': 'Volume: ',
		'ShowImages': 'Show Image',
		'ShowImagesDescription': 'Specify whether to show images (Default is Hand)',
		'DataSet': 'Data Set',
		'UploadDatapack': 'Upload ResoursePack',
		'DataPackProcessing': 'Processing...',
		'DataPackDescription': 'Upload it .A zip resource pack developed for PatPat. (Not all are supported)',
		
		'unpacker.sounds.json_isNotExtists': `File "sounds.json" is not found :(`,
		'unpacker.textures.json5_isNotExtists': `Texture config is not found :(`,
		'unpacker.textures.isNotExtists': `Failed to find or parse textures :(`,
		'unpacker.status.ok': `Resourse Pack is loaded! :)`,
		
	},
	'ru': {
		'GeneralSettings': "Настройки",
		'BlockList': "Черный список",
		'AllowSound': 'Разрешить звуки',
		'PatVolume': 'Громкость: ',
		'ShowImages': 'Показывать изображение',
		'ShowImagesDescription': 'Укажите, стоит ли показывать изображения',
		'DataSet': 'Набор данных',
		'UploadDatapack': 'Загрузить набор данных',
		'DataPackProcessing': 'Обработка...',
		'DataPackDescription': 'Загружайте .zip ресурспаки, разработанный для PatPat. (Поддерживаются не все)',		
		
		'unpacker.sounds.json_isNotExtists': `Файл "sounds.json" не найден :(`,
		'unpacker.textures.json5_isNotExtists': `Конфиг текстур не найден :(`,
		'unpacker.textures.isNotExtists': `Не удалось найти текстуры :(`,
		'unpacker.status.ok': `Пакет данных установлен! :)`,
	},
	"by": "ru"
}



TranslateAssistant.init('en', DICT);
const lang = navigator.language;
const LoadLanguage =
  TranslateAssistant.isLangAvailable(lang) ? lang : 'en';

TranslateAssistant.defaultLocale(LoadLanguage);
