<?php
$settingsDropdown = <<<EOT
    <div class="form-row">
        <label for="set-wpm-sel">Words per minute:</label>
        <select ng-model="settings.wpm" id="set-wpm-sel">
            <option value="200">100 WPM</option>
            <option value="200">150 WPM</option>
            <option value="200">200 WPM</option>
            <option value="250">250 WPM</option>
            <option value="300">300 WPM - Default speed</option>
            <option value="350">350 WPM</option>
            <option value="400">400 WPM</option>
            <option value="450">450 WPM</option>
            <option value="500">500 WPM</option>
        </select>
    </div>
    
    <div class="form-row">
        <div class="checkbox">
            <div class="check">
                <input ng-model="settings.pauseBetweenSentences" id="set-pause-sent-chk" type="checkbox">
                <span></span>
            </div>
            <label for="set-pause-sent-chk">Pause between sentences</label>
        </div>
    </div>
    
    <div class="form-row">
        <div class="checkbox">
            <div class="check">
                <input ng-model="settings.highlightFocusPoint" id="set-highlight-focus-point-chk" type="checkbox">
                <span></span>
            </div>
            <label for="set-highlight-focus-point-chk">Highlight focus point</label>
        </div>
    </div>

    <div class="form-row">
        <div class="checkbox">
            <div class="check">
                <input ng-model="settings.nightMode" id="set-nm-chk" type="checkbox">
                <span></span>
            </div>
            <label for="set-nm-chk">Night mode</label>
        </div>
    </div>

    <div class="form-row">
        <div class="checkbox">
            <div class="check">
                <input ng-model="settings.useSerifFont" id="set-serifFont-chk" type="checkbox">
                <span></span>
            </div>
            <label for="set-serifFont-chk">Use Serif font style</label>
        </div>
    </div>
EOT;

$keyboardDropdown = <<<EOT
    <p>Here are some shortcuts for you!</p>
EOT;

?><!doctype html>
<html class="no-js" lang="en" ng-app="speedReadingApp">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Speed read</title>
    <link rel="stylesheet" href="stylesheets/app.css" />
    
    <script src="js/modernizr.js"></script>
    <script>
        var base_url = '<?php $parsed = parse_url($_SERVER["REQUEST_URI"]); echo $parsed['path']; ?>';
    </script>
</head>
<body ng-controller="MainCtrl" class="{{ game.paused ? 'is-paused' : 'is-not-paused' }}
                                      {{ game.hasStarted ? 'has-started' : 'has-not-started' }}
                                      {{ settings.nightMode ? 'dark-mode' : 'bright-mode' }}
                                      {{ settings.highlightFocusPoint ? 'highlight-focus-point' : '' }}
                                      {{ settings.useSerifFont ? 'serif-font' : '' }}">

    <div class="top-bar">
        <div class="inner-container">
            
            <div class="bar-item">
                <h1>Speed reader</h1>
            </div>
            
            <div class="bar-item">
                <button class="button red" ng-click="startRead()">Start read <i class="fa fa-play"></i></button>
            </div>
            
            <div class="bar-item right">
                <button title="Show keyboard shortcuts" class="icon-button" toggle-dropdown="top-bar-keyboard-dropdown"><i class="fa fa-keyboard-o"></i></button>
        
                <div id="top-bar-keyboard-dropdown" class="dropdown">
                    <?php echo $keyboardDropdown; ?>
                </div>
            </div>
            
            <div class="bar-item right">
                <button title="Show settings" class="icon-button" toggle-dropdown="top-bar-drop-settings"><i class="fa fa-gear"></i></button>
        
                <div id="top-bar-drop-settings" class="dropdown">
                    <?php echo $settingsDropdown; ?>
                </div>
            </div>

        </div> <!-- inner container -->

        <div id="countdown-bar" class="countdown-bar">
            <div class="progress"></div>
        </div>
    </div> <!-- top bar -->

    <textarea ng-model="settings.text" class="editor" placeholder="Paste text or URL here..." spellcheck=false ng-paste="formatPastedText($event)" <?php if(!empty($_REQUEST['text'])) : ?> ng-init="settings.text='<?php echo htmlspecialchars($_REQUEST['text']); ?>'; settings.loadedTextFromQueryParam = true;" <?php endif; ?> ></textarea>
    
    <div class="word-canvas" ng-click="pauseRead()">

        <div class="top-controls">
            <div class="left">
                <button class="icon-button right-spacing show-if-paused" ng-click="continueRead(); $event.stopPropagation();" title="Continue"><i class="fa fa-play"></i></button>
                <button class="icon-button right-spacing show-if-not-paused" ng-click="pauseRead(); $event.stopPropagation();" title="Pause"><i class="fa fa-pause"></i></button>

                <button class="icon-button right-spacing" ng-click="goToPosition('last_sentence'); $event.stopPropagation();" title="Last sentence"><i class="fa fa-step-backward"></i></button>
                <button class="icon-button right-spacing" ng-click="restartRead(); $event.stopPropagation();" title="Restart"><i class="fa fa-undo"></i></button>
                <button class="icon-button" ng-click="stopRead(); $event.stopPropagation();" title="Stop"><i class="fa fa-stop"></i></button>
            </div>

            <div class="right">
                <div class="relative">
                    <button title="Show keyboard shortcuts" data-toggle-dropdown="in-read-keyboard-dropdown" class="icon-button"><i class="fa fa-keyboard-o"></i></button>
            
                    <div id="in-read-keyboard-dropdown" class="dropdown">
                        <?php echo $keyboardDropdown; ?>
                    </div>
                </div>

                <div class="relative">
                    <button title="Show settings" data-toggle-dropdown="in-read-drop-settings" class="icon-button"><i class="fa fa-gear"></i></button>
            
                    <div id="in-read-drop-settings" class="dropdown">
                        <?php echo $settingsDropdown; ?>
                    </div>
                </div>
            </div>

            <div class="center">
                {{ game.percentComplete(true) }}% complete
            </div>
        </div>

        <div class="word-container">
            <div class="center-point">
                <span class="before">{{ game.words[game.currentWord].raw.start | unsafe }}</span>
                <span class="{{ game.words[game.currentWord].raw.highlighted ? 'highlight' : '' }}">{{ game.words[game.currentWord].raw.highlighted | unsafe }}</span>
                <span class="special">{{ game.words[game.currentWord].raw.specialChar | unsafe }}</span>
                <span class="after">{{ game.words[game.currentWord].raw.end | unsafe }}</span>
            </div>
        </div>

        <div id="timeline" class="timeline">
            <div range-slider min="0" max="game.words.length" model-max="game.currentWord" pin-handle="min" show-values="false"></div>
        </div>
    </div>
    
    <!-- jQuery only used for range slider support -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.15/angular.min.js"></script>
    <script src="js/angular.rangeSlider.js"></script>
    <script src="js/nprogress.js"></script>
    <script src="js/app.js"></script>
</body>
</html>