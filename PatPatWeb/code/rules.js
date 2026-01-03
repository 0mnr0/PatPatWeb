// This is a file where you can specify the site domain and the additional search elements attached to it.
// This is used to fix elements on pages where images may be overlaid by the overlay.


const RuleSets = {
		"yandex.ru, ya.ru": `
			ul#search-result .Favicon,
			.Distribution.HeaderDesktopActions-Distribution.HeaderDesktopActions-Item,
			svg.FuturisInlineHeader-AliceLogoM, .HeaderDesktopActions-Button,
			.HeaderLogo, .HeaderLogo svg, .HeaderUser, .header-userBox,
			.UserPic-Image, .SwipeImage.MMImageWrapper
		`,
		
		"vk.com, vk.ru": `
			.AvatarRich__img, .vkuiRootComponent__host,
			.BasicAvatar, .vkuiImageBase__children
		`,		
		
		"youtube.com": `
			yt-thumbnail-view-model, ytd-player#inline-player .html5-video-container video,
			yt-icon.ytd-logo, .ytIconWrapperHost.ytd-logo, 
			yt-avatar-shape
		`,
		
		"google.com": `
			.boqOnegoogleliteOgbOneGoogleBar
		`,
		
		"sora.chatgpt.com": `
			video
		`,
	
		"wikipedia.org": `
			nav.central-featured, a.mw-wiki-logo
		`,
		
		"vk.com, vk.ru": `
			.AvatarRich__img, .vkuiAvatar__host, .OwnerPageAvatar__in,
			.BasicAvatar
		`,
		
		"x.com": `
			button[aria-label="Account menu"],
			div[data-testid="Tweet-User-Avatar"]
		`,
		
		"facebook.com": `
			i[data-visualcompletion="css-img"]
		`,
		
		"instagram.com": `
			._aagu
		`, // i hope this will be not renamed (yes, its an obfuscated class)
		
		'bing.com': `		
			.infopane .heading::after, .infopane .heading:focus-visible::after,
			span.id_avatar, div.imgContainer
		`,
		
		'twitch.tv': `		
			div.video-player div.video-ref video,
			span.id_avatar, div.imgContainer
		`,
		
		'linkedin.com': `		
			.profile-card-profile-picture, .share-box-feed-entry__avatar img,
			.ivm-image-view-model img
		`,
		
		'web.telegram.org': `		
			.Avatar>.inner, div.media-inner.interactive, .AnimatedSticker
		`,
		
		'addons.mozilla.org': `		
			.Header-title, .Header-title:link, 
		`,
	};
	
const GetSiteRuleSet = (siteHost) => {
		siteHost = siteHost.replace('www.', '');
		
		for (host of Object.keys(RuleSets)) { // RuleSet "," processing
			if ((host.replaceAll(' ','').split(',')).includes(siteHost)) { siteHost = host }			
		}
		
		let rules = RuleSets[siteHost];
		if (!rules) {return '';}
		
		return rules.replaceAll('\t', '').replaceAll('\n', '')
}
