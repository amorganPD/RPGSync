
Game.playerAnimations = function(activeScene) {
	var self = this;
	self.animating = 0;
	
	self.Move = function(activeScene) {
		var create = function () {
			// Use imported skeleton
			self.Move.animation = activeScene.player.skeletons;
		}
		this.start = function (activeScene, entity) {
			// Only play animation if previous state was idle
			if (entity.action == entity.actionType.Idle) {
				// Make sure no other animations are running
				if (entity.mesh.animatable) {
					entity.mesh.animatable.stop();
				}
				entity.action = entity.actionType.Move;
				entity.mesh.animatable = activeScene.beginAnimation(self.Move.animation, 0, 40, false, 1.3, function () {
					entity.action=entity.actionType.Idle;
					// entity.weaponMesh.rotation = new BABYLON.Vector3(Math.PI/6,entity.mesh.currentFacingAngle.y + Math.PI/2,Math.PI/8);
				});
			}
		}
		create(); // create animation
	};
	
	self.Idle = function(activeScene) {
		var create = function () {
			// Use imported skeleton
			self.Idle.animation = activeScene.player.skeletons;
		}
		this.start = function (activeScene, entity) {
			// Only play animation if previous state was idle
			if (entity.action == entity.actionType.Idle) {
				// Make sure no other animations are running
				if (entity.mesh.animatable) {
					entity.mesh.animatable.stop();
				}
				entity.action = entity.actionType.Idle;
				// TO DO: Add idle animation
				//entity.mesh.animatable = activeScene.beginAnimation(self.Move.animation, 0, 40, true, 1.0);
			}
		}
		create(); // create animation
	};
	
	self.Attack = function(activeScene) {
		var calculateKeys = function (animation) {
			var keys = []
			// Animation keys
			var startRot = activeScene.player.weaponCollisionMesh.rotation.y;
			keys.push({
				frame: 0,
				value: startRot
			});
			keys.push({
				frame: 20,
				value: startRot - .6*Math.PI
			});
			keys.push({
				frame: 21,
				value: startRot
			});
			//Adding keys to the animation object
			animation.setKeys(keys);
		}
		var create = function () {
			// Use imported skeleton
			self.Attack.animation = activeScene.player.skeletons;
			self.Attack.animationCollision = new BABYLON.Animation("attackAnimation", "rotation.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		}
		this.start = function (activeScene, entity) {
			// Only play animation if previous state was idle
			if (entity.action != entity.actionType.Attack) {
				//Attach animation to weaponCollisionMesh
				if (entity.weaponCollisionMesh.animations == undefined) {
					entity.weaponCollisionMesh.animations.push(self.Attack.animationCollision);
				}
				else {
					entity.weaponCollisionMesh.animations[0] = self.Attack.animationCollision;
				}
				calculateKeys(self.Attack.animationCollision);
				// Make sure no other animations are running
				if (entity.mesh.animatable) {
					entity.mesh.animatable.stop();
				}
				entity.action=entity.actionType.Attack;
				entity.mesh.animatable2 = activeScene.beginAnimation(entity.weaponCollisionMesh, 0, 21, false, 1.0);
				entity.mesh.animatable = activeScene.beginAnimation(self.Attack.animation, 50, 80, false, 1.4, function () {
					entity.action=entity.actionType.Idle;
				});
			}
		}
		create(); // create animation
	};
	
	self.TakeDmg = function(activeScene) {
		var create = function () {
			//create animations for player
			self.TakeDmg.animation = new BABYLON.Animation("dieAnimation", "material.emissiveColor", 60, BABYLON.Animation.ANIMATIONTYPE_COLOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);// Animation keys
			// create keys
			var keys = [];
			keys.push({
				frame: 0,
				value: new BABYLON.Color3(1,0,0)
			});
			keys.push({
				frame: 10,
				value: new BABYLON.Color3(0,0,0)
			});
			keys.push({
				frame: 20,
				value: new BABYLON.Color3(1,0,0)
			});
			keys.push({
				frame: 30,
				value: new BABYLON.Color3(0,0,0)
			});
			//Add keys to the animation object
			self.TakeDmg.animation.setKeys(keys);
			//Attach animation to player mesh
			//activeScene.player.mesh.animations.push(self.TakeDmg.animation);
		}
		this.start = function (activeScene, entity) {
			if (self.animating == 0) {
				self.animating = 1;
				//Attach animation to player mesh
				if (entity.mesh.animations == undefined) {
					entity.mesh.animations.push(self.TakeDmg.animation);
				}
				else {
					entity.mesh.animations[0] = self.TakeDmg.animation;
				}
				entity.mesh.animatable = activeScene.beginAnimation(entity.mesh, 0, 30, false, 1.0, function () {
					self.animating=0;
				});
			}
		}
		create(); // create animation
	};
	
	self.Die = function(activeScene) {
		var create = function () {
			//create animations for player
			self.Die.animation = new BABYLON.Animation("dieAnimation", "scaling", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
			// create keys
			var keys = [];
			var startScaling = activeScene.player.mesh.scaling;
			var endScaling = activeScene.player.mesh.scaling;
			//At the animation key 0, the value of scaling is "1"
			keys.push({
				frame: 0,
				value: startScaling.add(new BABYLON.Vector3(.1, .1, .1))
			});
			keys.push({
				frame: 10,
				value: startScaling.subtract(new BABYLON.Vector3(.5, .5, .5))
			});
			keys.push({
				frame: 20,
				value: startScaling.add(new BABYLON.Vector3(.4, .4, .4))
			});
			keys.push({
				frame: 30,
				value: endScaling
			});
			keys.push({
				frame: 60,
				value: endScaling
			});
			//Add keys to the animation object
			self.Die.animation.setKeys(keys);
			//Attach animation to player mesh
			//activeScene.player.mesh.animations.push(self.Die.animation);
		}
		this.start = function (activeScene, entity) {
			entity.mesh.animatable.stop();
			self.animating = 1;
			//Attach animation to player mesh
			if (entity.mesh.animations == undefined) {
				entity.mesh.animations.push(self.Die.animation);
			}
			else {
				entity.mesh.animations[0] = self.Die.animation;
			}
			entity.mesh.animatable = activeScene.beginAnimation(entity.mesh, 0, 60, false, 1.0, function () {
				self.animating = 0;
				Game.restartPlayer(activeScene);
			});
		}
		create(); // create animation
	};
	
	self.init = function (activeScene) {
		this.idle = new self.Idle(activeScene);
		this.move = new self.Move(activeScene);
		this.attack = new self.Attack(activeScene);
		//this.attackCollision = new self.AttackCollision(activeScene);
		this.takeDmg = new self.TakeDmg(activeScene);
		this.die = new self.Die(activeScene);
	}
}