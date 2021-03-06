;(function() {

	var $scope = {};

	chrome.storage.sync.get(['quickAccessGlobal', 'quickAccessBlacklist'], function(res) {

		// Abort if blacklisted
		if(res.quickAccessGlobal === false || (res.quickAccessBlacklist || []).includes(window.location.hostname)) {
			return false;
		}

		parsePage();
		if($scope.parseResults) {
			injectHTML();
			setupEventListeners();
			estimateParseTime();

			$scope.quickAccessContainer.classList.remove('hidden');
		}
	});


	function injectHTML() {
		var html = '';

		html += '<div id="sr-qa-container" class="sr-qa-container hidden">';

		html += 	'<a title="Read with Champ" id="sr-qa-trigger-read" class="sr-qa-button">';
		html +=			'<div class="sr-label">Read with Readio, <span id="sr-read-time-container"></span></div>';
		html +=	 		'<div class="sr-icon sr-icon-book"></div>';
		html +=		'</a>';

		html += 	'<a title="Edit" id="sr-qa-trigger-edit" class="sr-qa-button">';
		html +=			'<div class="sr-label">Open editor to paste text</div>';
		html +=	 		'<div class="sr-icon sr-icon-edit"></div>';
		html +=		'</a>';

		html += 	'<a title="Hide" id="sr-qa-trigger-hide" class="sr-qa-button">';
		html +=			'<div class="sr-label">Disable quick access buttons</div>';
		html +=	 		'<div class="sr-icon sr-icon-close"></div>';
		html += 	'</a>';

		html += '</div>';

		html += '<div id="sr-hide-qa-dialog" class="sr-dialog-container">';
		html += 	'<div class="sr-dialog-inner">';
		html +=	 		'<p>Hide quick access buttons</p>';
		html +=	 		'<p>';
		html +=	 			'<a href="#" id="sr-hide-qa-everywhere-button" class="sr-dialog-button">All websites</a>';
		html +=	 			' or ';
		html +=	 			'<a href="#" id="sr-hide-qa-justhere-button" class="sr-dialog-button">'+ window.location.hostname +'</a>';
		html +=	 			' or ';
		html +=	 			'<a href="#" class="sr-dialog-close">cancel</a>';
		html +=	 		'</p>';
		html += 	'</div>';
		html += '</div>';

		document.body.insertAdjacentHTML('afterbegin', html);
	}

	function estimateParseTime() {

		chrome.storage.sync.get('wpm', function(res) {
			var timeContainer = document.getElementById('sr-read-time-container'),

				words = $scope.parseResults.textContent.split(/\s+/g),
				wordCount = words.length,
				wpmOpt = res.wpm || 300, // Assuming 300 is default wpm

				wpm = (wordCount/wpmOpt) * 1.2, // Add 20% words, magic number to be more correct
				wpmRound = Math.floor(wpm),
				text = '';

			if(wpmRound < 1) {
				text = '<1 min';
			} else {
				text = wpmRound + ' min';
			}

			timeContainer.innerHTML = text;
		});
	}

	function setupEventListeners() {
		$scope.quickAccessContainer = document.getElementById('sr-qa-container');

		$scope.readBtn = document.getElementById('sr-qa-trigger-read');
		$scope.editBtn = document.getElementById('sr-qa-trigger-edit');
		$scope.disableDialogTrigger = document.getElementById('sr-qa-trigger-hide');

		$scope.disableEverywhereBtn = document.getElementById('sr-hide-qa-everywhere-button');
		$scope.disableJustHereBtn = document.getElementById('sr-hide-qa-justhere-button');

		$scope.dialogs = document.querySelectorAll('.sr-dialog-container');
		$scope.dialogCloseTriggers = document.querySelectorAll('.sr-dialog-close');

		$scope.quickAccessDisableDialog = document.getElementById('sr-hide-qa-dialog');


		$scope.disableEverywhereBtn.onclick = function() {
			chrome.storage.sync.set({ quickAccessGlobal : false });
			if($scope.quickAccessContainer) $scope.quickAccessContainer.classList.add('hidden');
			hideDialogs();
		}

		$scope.disableJustHereBtn.onclick = function() {
			addToBlacklist();
			if($scope.quickAccessContainer) $scope.quickAccessContainer.classList.add('hidden');
			hideDialogs();
		}

		$scope.dialogs.forEach(function(d) {
			d.onclick = function(e) {
				if( e.target.classList.contains('sr-dialog-container') ) {
					d.classList.remove('visible');
				}
			}
		});

		$scope.dialogCloseTriggers.forEach(function(t) {
			t.onclick = function(e) {
				hideDialogs();
			}
		});

		function hideDialogs() {
			if($scope.dialogs) {
				$scope.dialogs.forEach(function(d) {
					d.classList.remove('visible');
				});
			}
		}

		// Make button visible on load
		setTimeout(function() {
			$scope.readBtn.className += ' visible';
		}, 20);


		// Read page
		$scope.readBtn.onclick = function(e) {
			e.preventDefault();
			requestRead();
		};

		// Request edit
		$scope.editBtn.onclick = function(e) {
			e.preventDefault();
			requestEditor();
		}

		// Request blacklist
		$scope.disableDialogTrigger.onclick = function(e) {
			e.preventDefault();

			$scope.quickAccessDisableDialog.classList.add('visible');
		}
	}


	function parsePage() {

		// document.cloneNode(true) caused issues on certain pages
		var doc = document.implementation.createHTMLDocument();
		doc.body.innerHTML = document.body.innerHTML;

		var loc = document.location,
			uri = {
			  spec: loc.href,
			  host: loc.host,
			  prePath: loc.protocol + "//" + loc.host,
			  scheme: loc.protocol.substr(0, loc.protocol.indexOf(":")),
			  pathBase: loc.protocol + "//" + loc.host + loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1)
			},
			result;

		result =  new Readability(uri, doc).parse();

		if(result) {
			$scope.parseResults = result;
			return result;
		}

		return false;
	}

	function requestRead() {

		// If we found text to read, send it
		if($scope.parseResults && $scope.parseResults.content) {

			// Send parsed text
			chrome.extension.sendMessage({
				action: 'requestRead',
				text: $scope.parseResults.content
			});

		// Otherwise open editor
		} else {
			chrome.extension.sendMessage({
				action: 'requestEdit'
			});
		}
	}

	function requestEditor() {

		// Send parsed text
		chrome.extension.sendMessage({
			action: 'requestEdit'
		});
	}

	function addToBlacklist() {
		chrome.storage.sync.get('quickAccessBlacklist', function(res) {
			var blacklist = res.quickAccessBlacklist || [],
				currDomain = window.location.hostname;

			if( !blacklist.includes(currDomain) ) {
				blacklist.push(currDomain);
				chrome.storage.sync.set({ quickAccessBlacklist: blacklist });
			}
		});
	}

	function removeFromBlacklist() {
		chrome.storage.sync.get('quickAccessBlacklist', function(res) {
			var blacklist = res.quickAccessBlacklist || [],
				currDomain = window.location.hostname,
				currDomIndex = blacklist.indexOf(currDomain);

			if( currDomIndex !== -1 ) {
				blacklist.splice(currDomIndex, 1);
				chrome.storage.sync.set({ quickAccessBlacklist: blacklist });
			}
		});
	}


	// Communication with background script
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

		// To prevent double injection of contentscript
		if(request.action === 'ping') {
			sendResponse({
				message: true
			});

		// When text is requested
		} else if(request.action === 'getParseData') {

			// $scope.parseResults was created on load
			if(!$scope.parseResults) {
				alert("Can't find any content to read.")
				return false;
			}

			sendResponse($scope.parseResults.content);
		

		} else if(request.action === 'showQuickAccess') {
			if($scope.quickAccessContainer) $scope.quickAccessContainer.classList.remove('hidden');

		} else if(request.action === 'hideQuickAccess') {
			if($scope.quickAccessContainer) $scope.quickAccessContainer.classList.add('hidden');
		
		} else if(request.action === 'readPage') {
			requestRead();

		}
	});

})();