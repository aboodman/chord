// Copyright 2004, Aaron Boodman
// This code is public domain. Please use it for good, not evil.

Chord.TRIGGER_KEY = 17; // ctrl
Chord.MAX_DELAY = 500; // half second or less between chord members

// eg: new Chord("kc");
function Chord(chordWord) {
	chordWord = chordWord.toUpperCase();

	this.members = [];
	
	for (var i = 0; i < chordWord.length; i++)
		this.members[i] = chordWord.charCodeAt(i);

	this.chordWord = chordWord;
	this.onComplete = new Function();
	this.onReset = new Function();

	var self = this;
	var currentMember, currentKey, lockedOn, timerId, started;

	reset();

	this.start = function() {
		ev_attach("keydown", handleKeyDown);
		ev_attach("keyup", handleKeyUp);
	}

	this.stop = function() {
		reset();
		ev_detach("keydown", handleKeyDown);
		ev_detach("keyup", handleKeyUp);
	}

	function handleKeyDown(e) {
		e = ev_fix(e);

		if (e.keyCode == Chord.TRIGGER_KEY) {
			lockedOn = true;
		}
		else if (lockedOn) {
			var number = findInArray(self.members, e.keyCode);

			if (number == currentKey + 1) {
				killResetTimer();

				if (!started) {
					started = true;
				}

				currentKey = number;
				e.preventDefault();

				if (currentKey == self.members.length - 1) {
					self.onComplete();
					reset();
				}

				setResetTimer();
			}
			else if (started) {
				reset();
				self.onReset();
			}
		}
	}

	function handleKeyUp(e) {
		e = ev_fix(e);

		if (e.keyCode == Chord.TRIGGER_KEY) {
			reset();

			if (started) {
				self.onReset();
			}
		}
	}

	function reset() {
		killResetTimer();
		currentMember = -1;
		currentKey = -1;
		lockedOn = false;
		started = false;
		timerId = null;
	}

	function setResetTimer() {
		killResetTimer();
		timerId = window.setTimeout(reset, Chord.MAX_DELAY);
	}

	function killResetTimer() {
		if (timerId != null) {
			window.clearTimeout(timerId);
			timerId = null;
		}
	}

	function findInArray(arr, thing) {
		var l = arr.length;
		
		for (var i = 0; i < l; i++)
			if (arr[i] == thing)
				return i;

		return -1;
	}

	function ev_attach(eventName, fp) {
		if (document.attachEvent) document.attachEvent("on"+eventName, fp);
		else if (document.addEventListener) document.addEventListener(eventName, fp, false);
	}

	function ev_detach(eventName, fp) {
		if (document.detachEvent) document.detachEvent("on"+eventName, fp);
		else if (document.removeEventListener) document.removeEventListener(eventName, fp, false);
	}

	function ev_fix(e) {
		if (!e && window.event) {
			e = window.event;
		}

		if (!e.preventDefault) {
			e.preventDefault = function() {
				this.returnValue = false;
				this.keyCode = 0;
			}
		}

		return e;
	}
}