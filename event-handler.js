function handleEvents(events={}) {
	// Sorts tags first, then classes and IDs
	const sortKeys = function(a, b) {
		const aIDorClass = a.includes("#") || a.includes(".");
		const bIDorClass = b.includes("#") || b.includes(".");
		return aIDorClass && !bIDorClass ? 1 : (bIDorClass && !aIDorClass ? -1 : 0);
	}

	// Start listening for events
	const bubbleEvents = [];
	const eventKeys = Object.keys(events);
	for (let i = 0, len = eventKeys.length; i < len; i++) {
		const event = eventKeys[i];
		const eventObj = events[event];

		// Determine which events bubble
		const e = new Event(event);
		if (!e.bubbles) {
			bubbleEvents.push(e.type);
		}

		// Classes and IDs must be checked after tags
		const eventObjKeys = Object.keys(eventObj).sort(sortKeys);
		const numEventObjKeys = eventObjKeys.length;

		// Add event listener to window in case elements get deleted
		window.addEventListener(event, function(e) {
			const path = e.composedPath();
			for (let j = 0, pathLen = path.length; j < pathLen; j++) {
				const elem = path[j];

				// window and document do not have a matches function
				if (!elem.matches) {
					if (eventObj.hasOwnProperty("window")) {
						eventObj["window"].call(elem, e);
					} else if (eventObj.hasOwnProperty("document")) {
						eventObj["document"].call(elem, e);
					}
					return;
				}

				for (let k = 0; k < numEventObjKeys; k++) {
					const selector = eventObjKeys[k];
					if (elem.matches(selector) && eventObj.hasOwnProperty(selector)) {
						const startClass = elem.className;
						const startID = elem.id;
						eventObj[selector].call(elem, e);
						if (startClass != elem.className || startID != elem.id) {
							// Element selector changed, return to prevent duplicate calls
							return;
						}
					}
				}
			}
		}, bubbleEvents.includes(event)); // set as passive for non-bubbling events
	}
	
	return events;
}