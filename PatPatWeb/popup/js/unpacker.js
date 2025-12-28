const getFirstJson5 = function(zip, folderPath) {
  const files = Object.keys(zip.files)
    .filter(path =>
      path.startsWith(folderPath) &&
      (path.endsWith(".json5") || path.endsWith('.json')) &&
      !zip.files[path].dir
    )
    .sort();

  return files.length ? zip.files[files[0]] : null;
}







const unpackData = async function (file) {
	const zip = await JSZip.loadAsync(file);
	
	let soundsFile = zip.file("assets/patpat/sounds.json");	
	
	if (!soundsFile) {
		return {status: 'fail', reason: 'unpacker.sounds.json_isNotExtists'};
	}
	const sounds = JSON.parse(await soundsFile.async("text"));
	
	
	let json5File = getFirstJson5(zip, "assets/patpat/textures/");
	const jsonFileExtra1 = getFirstJson5(zip, "assets/patpat/textures/default");    if (!json5File && jsonFileExtra1) {json5File = jsonFileExtra1}
	const jsonFileExtra2 = getFirstJson5(zip, "assets/patpat/textures/easter");     if (!json5File && jsonFileExtra2) {json5File = jsonFileExtra2}
	
	if (!json5File) {
	    console.error("json5 файл не найден");
	    return {status: 'fail', reason: 'unpacker.textures.json5_isNotExtists'};
	}
	const texturesData = JSON5.parse(await json5File.async("text"));
	
	let SoundsList = (sounds[Object.keys(sounds)[0]]).sounds;               //patpat:sound_name.ogg
	let AnimationLength = texturesData.animation.duration;                 // <int> (e.g. 300)
	let TextureFrames = texturesData.animation.frame.totalFrames;          // <int>
	let Texture = texturesData.animation.texture.replace('patpat:','');    // textures/animated_piston_texture.png
	
	for (let i = 0; i < SoundsList.length; i++) { SoundsList[i] = SoundsList[i].replaceAll('patpat:', ''); }
	
	
	const pngFile = zip.file(`assets/patpat/${Texture}`);
	if (!pngFile) return {status: 'fail', 'reason': 'unpacker.textures.isNotExtists'}
	const pngBlob = await pngFile.async("blob");
	
	
	const SplittedTextures = await splitIntoFiles(pngBlob, TextureFrames);
	const base64Textures = await convertBlobs(SplittedTextures);
	
	const Base64Sounds = await getBase64Sounds(zip, SoundsList);
	if (Base64Sounds.status !== undefined) {return Base64Sounds}
	
	
	const HandDataPack = {
		'@DataPack': true,
		'PackPlace': '@DataPack',
		'sequence': base64Textures,
		'sounds': Base64Sounds,
		'animLength': AnimationLength,
		'author': 'Unknown'
	}
	
	await Settings.set( 'SelectedPack', '@DataPack' )
	await Settings.set( '@DataPack', HandDataPack );
	return {status: 'ok', reason: 'unpacker.status.ok'}
}



const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const convertBlobs = async (urls) => {
    const promises = urls.map(async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return await blobToBase64(blob);
    });

    return await Promise.all(promises);
};




const getBase64Sounds = async (zip, soundList) => {
	try{ 
		let convertedSounds = [];
		
		for (sound of soundList) { 
			const oggFile = zip.file(`assets/patpat/sounds/${sound}.ogg`);
			const oggBlob = await oggFile.async("blob");
			convertedSounds.push(await blobToBase64(oggBlob))
		}
		return convertedSounds;
	} catch(e) {
		warn(e);
		return {status: 'fail', reason: 'SoundsListConvertFail'}
	}
};















const splitIntoFiles = async (blobich, TextureFrames) => {
	const imgUrl = URL.createObjectURL(blobich);
	const img = new Image();
	img.src = imgUrl;
	
	
	await img.decode();
	const parts = await splitImageToParts(img, TextureFrames);
	const outParts = parts.map(blob => URL.createObjectURL(blob));
	return outParts;
}




const splitImageToParts = async (img, partsCount) => {
    const results = [];

    const partWidth = Math.floor(img.width / partsCount);
    const height = img.height;

    const canvas = document.createElement("canvas");
    canvas.width = partWidth;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context is null");

    for (let i = 0; i < partsCount; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(
            img,
            i * partWidth,
            0,
            partWidth,
            height,
            0,
            0,
            partWidth,
            height
        );

        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(b => {
                if (!b) reject(new Error("toBlob returned null"));
                else resolve(b);
            }, "image/png");
        });

        results.push(blob);
    }

    return results;
}
