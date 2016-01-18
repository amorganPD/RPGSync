/*********************************************************************
 BabylonMechanics.js
   Create the init functions for each scene. These functions should
   call the Create*Scene and setup their renderLoops.
*********************************************************************/

Game.initStartScene = function() {
	var activeScene;
	
	// Create Start Scene
	activeScene = Game.scene.push(Game.CreateStartScene(Game.engine)) - 1;
	
	Game.scene[activeScene].renderLoop = function () {
		//Render scene and any changes
		if (this.isLoaded) {
			if (Game.engine.loopCounter > 1000) {
				Game.engine.loopCounter=0;
			}
			else {
				Game.engine.loopCounter++;
			}
			if (Game.engine.loopCounter % 5 == 0) {
				$('#fps').text('FPS: ' + Game.engine.getFps().toFixed());
			}
			this.render();
		}
	};
}

Game.initGameScene = function() {
	var activeScene;
	
	// Create Game Scene
	activeScene = Game.scene.push(Game.CreateGameScene(Game.engine)) - 1;
	
	Game.scene[activeScene].enemyCounter=0;
	// Create renderLoop for this scene
	Game.scene[activeScene].renderLoop = function () {
			
		if (!this.isErrthingReady) {
			if (this.isReady() && this.isLoaded) {
				this.isErrthingReady = true;
			}
			//when everything is ready this gets executed once
			if (this.isErrthingReady) {
				/* Template Code
				for (var i=0; i < this.activeRoom.enemy.length; i++) {
					this.activeRoom.enemy[i].velocity = {'direction' : new BABYLON.Vector3(0,this.gravity.y,0), 'angle': 0};
				}
				*/
				this.player.attacking=false;
				this.player.mesh.currentFacingAngle = new BABYLON.Vector3(this.player.mesh.rotation.x, this.player.mesh.rotation.y, this.player.mesh.rotation.z);
				this.octree = this.createOrUpdateSelectionOctree(64, 2);
				
				if (Game.debug) {
					this.debugLayer.show();
					$('#DebugLayerStats').css({"bottom": "1em"});
					$('#DebugLayerStats').css({"right": "1em"});
					$('#DebugLayerDrawingCanvas').css({"width": "90%"});
					$('#DebugLayerDrawingCanvas').css({"height": "90%"});
				}
				
				//start game logic loop (only one instance can occur)
				timedLoop.registerFunction(this.logicLoop);
				timedLoop.start();
				
				// TO DO: Implement optimization (only available in BJS v2+)
				//BABYLON.SceneOptimizer.OptimizeAsync(Game.scene[Game.activeScene]);
				// this.optimizeOptions = BABYLON.SceneOptimizerOptions.ModerateDegradationAllowed();
				// this.optimizeOptions.targetFrameRate=60;
				// BABYLON.SceneOptimizer.OptimizeAsync(Game.scene[activeScene], this.optimizeOptions, function() {
				   // // On success
				// }, function() {
				   // // FPS target not reached
				// });
			}
		}
		else {
			//Render scene and any changes
			this.render();
		}
	};	
	
}

Game.runRenderLoop = function () {
	Game.engine.stopRenderLoop();

	// Once the scene is loaded, register a render loop to render it
	setImmediate(function(){
		Game.engine.runRenderLoop(function () { 
			Game.scene[Game.activeScene].renderLoop();
		});
	});
}
