/*
	ScriptLoader v1.0

	A utility to load javascript and css files dynamically. Call success or failure functions at the end.

	Author: Asim Ishaq
	Email: asim709@gmail.com
	Web: asimishaq.com

	License: GPL v2 or later
*/


var ScriptLoader = {
	/**
	@param 	scripts array of css and js files
			Format: [{file:"",type:"css"},file:"",type:"js"},..]
	@param 	success callback function if all scripts are loaded successfully.
	@param 	failure callback function if any script fails loading or timeouts.
	*/
	load: function (scripts, success, failure) {

		var LoaderObj = {};
			LoaderObj.statusInterval = 10;	
			LoaderObj.scripts = scripts;
			LoaderObj.onSuccess = success;
			LoaderObj.onFailure = failure;
			LoaderObj.timeout = 10000;
			LoaderObj.files = [];
			LoaderObj.head = document.getElementsByTagName("head")[0];
			//Debug
			window.aaa = LoaderObj;

		/*Write Files in Head tag*/
		for (var i=0; i<scripts.length; i++) {
			
			var scriptName = scripts[i].type.toLowerCase();
			var node = null;

			//JS File
			if (scriptName == "js") {
				node = document.createElement("script");
				node.setAttribute("type","text/javascript");
				node.setAttribute("src",LoaderObj.scripts[i].file);
				node.onload = function () {this.loaded = true;};
			} 
			//CSS File
			else if (scriptName == "css") {
				node = document.createElement("link");
				node.setAttribute("type","text/css");
				node.setAttribute("rel","stylesheet");
				node.setAttribute("href",LoaderObj.scripts[i].file);
				node.onload = function () {this.loaded = true;};
			}
			//BOTH
			if (scriptName == "js" || scriptName == "css") {
				LoaderObj.head.appendChild(node);
				LoaderObj.files.push({
					node:node, 
					file:scripts[i].file, 
					type:scripts[i].type, 
					loaded:false, 
					elphased:0,
					stopped:false
				});
			}
		}

		//If there is any resource to load then load it
		if (LoaderObj.files.length > 0 ) {
			(function (Loader) {
				Loader.timerId = window.setInterval(function () {
					var pendingCount = 0;
					var loadedCount = 0;

					for (var i=0; i<Loader.files.length; i++) {
						
						//IF not loaded and not timeout then try to recheck status
						if (Loader.files[i].elphased <= Loader.timeout) {
							
							if (Loader.files[i].loaded == false ) {
								if (Loader.files[i].node.loaded) {
									Loader.files[i].loaded = true;
								}
								Loader.files[i].elphased += Loader.statusInterval;
							} 
						}

						if (Loader.files[i].loaded == true) {
							loadedCount ++;
						} else if (Loader.files[i].loaded == false && Loader.files[i].elphased <= Loader.timeout)  {
							pendingCount ++;
						}
					}

					//If no script is pending then stop timer
					if (pendingCount == 0) {
						window.clearInterval(Loader.timerId);
						if (loadedCount == Loader.files.length) 
							Loader.onSuccess();
						else 
							Loader.onFailure();
					}
			}, Loader.statusInterval);

		}) (LoaderObj);
	}
	}
};