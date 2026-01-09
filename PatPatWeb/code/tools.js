const isFireFox = navigator.userAgent.toLowerCase().includes('firefox');
const BrowserContext = (typeof chrome === 'object') ? chrome : browser;






const Attribute = {
	getStylesLine: (element) => {
		const styles = element.style;
		let elementInLineStyle = '';
		for (styleAttributeName of styles) {
			elementInLineStyle += (`${styleAttributeName}: ${styles[styleAttributeName]}; `)
		}
		return elementInLineStyle;
		
	},
	
	
	existenceValidation: (element, attr) => {
		let FinalAttribute = element.style[attr];
		if (FinalAttribute === 'none' || !FinalAttribute) {return '';}
		return FinalAttribute
	}, 
	
	get: (element, attr, defaultValue=null) => {
		let FinalAttribute = window.getComputedStyle(element)[attr];
		if (FinalAttribute === 'none') {FinalAttribute = defaultValue; wasEmpty = true;}
		return FinalAttribute
	}, 
	
	getScale: (element) => {
		let Scale = Attribute.get(element, 'scale', null)
		if (Scale === null) {Scale = '1 1'}
		Scale = Scale.split(' ');
		
		return {
			XScale: Number(Scale[0]),
			YScale: Number(Scale[1])
		}
	}, 
}








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
	
