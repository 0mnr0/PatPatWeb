const isFireFox = navigator.userAgent.toLowerCase().includes('firefox');
const BrowserContext = (typeof chrome === 'object') ? chrome : browser;






const Attribute = {
	get: (element, attr, defaultValue=null) => {
		let FinalAttribute = window.getComputedStyle(element)[attr];
		if (FinalAttribute === 'none') {FinalAttribute = defaultValue}
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