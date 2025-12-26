
let scripts = [
			'code/LightCore',
			'code/tools'
			]



function InjectScript(list, indexOfScript){
	function LoadNextScript(){
		if (indexOfScript+1 < list.length) {
			InjectScript(list, indexOfScript+1)
		}
	} 
	
	try{
		let ScriptLocation = list[indexOfScript] +'.js'
		
		
		let script = document.createElement('script');
		script.src = chrome.runtime.getURL(ScriptLocation);
		(document.head || document.documentElement).appendChild(script);
		
		
		script.onload = () => {
			script.remove();
			ScriptLocation = null;
			script = null;
			LoadNextScript()
		};
		
	}catch(e){console.error(e); throw(e); LoadNextScript();}
}
InjectScript(scripts, 0)
