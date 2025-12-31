const Toast = {
	get: (id) => { return find('div.toast.id'+id) },
	find: (id) => { return find('div.toast.id'+id) },
	create: function(text, len, closeText) {
		if (len === undefined) {len = 2000;}
		if (len < 0 && typeof closeText !== 'string') {
			throw "If show length is infinity - then you must specify close button on the Toast"
		}
		if (len < 0 && closeText.replaceAll(" ",'').length <= 0) {
			throw "Please specify button text!"
		}
		const ToastID = random(1000, 10000);
		let newToast = document.createElement('div')
		newToast.className = 'toast id'+ToastID;
		newToast.innerHTML = `
		<span> ${text} </span>
		${typeof closeText === 'string' ? `<button> ${closeText} </button>` : ""}
		`;
		
		body.appendChild(newToast);
		if (typeof closeText === 'string') {
			newToast.addEventListener('click', () => {
				Toast.fadeOutAndRemove(ToastID);
			})
		}
		runLater(() => {
			newToast.classList.add('visible');
		}, 10)
		
		
		if (len >= 0) {
			runLater(() => {
				Toast.fadeOutAndRemove(ToastID);
			}, len)
		}
		
		return ToastID;
	},
	fadeOutAndRemove: (id) => {
		someToast = Toast.get(id);
		if (someToast) { // can be deleted
			someToast.classList.remove('visible');
			runLater(() => {someToast.remove();}, 500);
		}
	},
	remove: (id, force) => {
		someToast = Toast.get(id);
		force ? someToast.remove() : Toast.fadeOutAndRemove(id)
	},
}