var EntityType = {
    Player: 0,
    Enemy: 1,
	Boss: 2
};

var WeaponType = {
	Melee: 0,
	Projectile: 1,
}

function Entity(mesh, options) {

	this.mesh = mesh;
	this.mesh.rotationOffset = new BABYLON.Vector3(0,0,0);
	this.actionType = {
		Idle: 0,
		Move: 1,
		Attack: 2,
		TakeDmg: 3,
		Die: 4
	}

	$.extend(this,{
		weaponMesh: {},
		type: EntityType.Enemy,
		health: 1,
		maxHealth: 1,
		damage: 1,
		weapon: [{'name': 'Steel Sword', 'type': WeaponType.Melee, 'range': 16, 'dmgModifier': 0, 'speedModifier': 1}],
		speed: 1,
		velocity: {'magnitude': new BABYLON.Vector3(0,0,0), 'angle': 0},
		attacking: false,
		action: 0,
		attack: [{type: 0, weapon: 0}],
		activeAttack: 0,
		counter: 0,
		pathing: 0,
		isDead: false
	},options||{});
	
	this.maxHealth=this.health;
}


Game.importedAnimations = function(entity) {
	var self = this;
	self.animating = 0;
	
	self.Move = function(activeScene, entity) {
		var create = function () {
			// find and set keys 0 - 100
			// TODO: Parse and populate keys
			// if moveKeys does not exist, set default
			if (entity.moveKeys == undefined) {
				entity.moveKeys = [];
				entity.moveKeys.push(0);
				entity.moveKeys.push(40);
			}
		}
		this.start = function (activeScene, entity) {
			// Only play animation if previous state was idle
			if (entity.action == entity.actionType.Idle) {
				// Make sure no other animations are running
				if (entity.mesh.animatable) {
					entity.mesh.animatable.stop();
				}
				entity.action = entity.actionType.Move;
				entity.mesh.animatable = activeScene.beginAnimation(entity.skeletons, entity.moveKeys[0], entity.moveKeys[1], false, 1, function () {
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
		var create = function () {
			// if attackKeys does not exist, set default
			if (entity.attackKeys == undefined) {
				entity.attackKeys = [];
				entity.attackKeys.push(50);
				entity.attackKeys.push(80);
			}
		}
		this.start = function (activeScene, entity) {
			// Only play animation if previous state was idle
			if (entity.action != entity.actionType.Attack) {
				// Make sure no other animations are running
				if (entity.mesh.animatable) {
					entity.mesh.animatable.stop();
				}
				entity.action=entity.actionType.Attack;
				entity.mesh.animatable = activeScene.beginAnimation(entity.skeletons, entity.attackKeys[entity.attack[entity.activeAttack].type*2], entity.attackKeys[entity.attack[entity.activeAttack].type*2+1], false, 1*entity.weapon[entity.activeAttack].speedModifier, function () {
					Game.detectEnemyHit(activeScene, entity);
					entity.action=entity.actionType.Idle;
					if (entity.type == EntityType.Boss) {
						entity.activeAttack = Game.getRandomInt(0,(entity.attack.length)-1);
					}
				});
			}
		}
		create(); // create animation
	};
	
	self.TakeDmg = function(activeScene) {
		var create = function () {
			// TODO: Change to imported animations
			//create animations for player
			self.TakeDmg.animation = new BABYLON.Animation("dieAnimation", "material.emissiveColor", 60, BABYLON.Animation.ANIMATIONTYPE_COLOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);// Animation keys
			// create keys
			var keys = [];
			keys.push({
				frame: 0,
				value: new BABYLON.Color3(1,0,0)
			});
			keys.push({
				frame: 20,
				value: new BABYLON.Color3(0,0,0)
			});
			keys.push({
				frame: 40,
				value: new BABYLON.Color3(1,0,0)
			});
			keys.push({
				frame: 60,
				value: new BABYLON.Color3(0,0,0)
			});
			//Add keys to the animation object
			self.TakeDmg.animation.setKeys(keys);
			//create animations for player
			//self.TakeDmg.animationKnockback = new BABYLON.Animation("knockbackAnimation", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		}
		this.start = function (activeScene, entity) {
			// Make sure no other animations are running
			if (entity.mesh.animatable) {
				entity.mesh.animatable.stop();
			}
			entity.action = entity.actionType.TakeDmg;
			self.animating = 1;
			//Attach animation to player mesh
			if (entity.mesh.animations == undefined) {
				entity.mesh.animations.push(self.TakeDmg.animation);
			}
			else {
				entity.mesh.animations[0] = self.TakeDmg.animation;
			}
			entity.mesh.animatable = activeScene.beginAnimation(entity.mesh, 0, 60, false, 1.0, function () {
				entity.action = entity.actionType.Move;
			});
		}
		create(); // create animation
	}
	
	self.Die = function(activeScene, entity) {
		var create = function () {
			// TODO: Change to imported animations
			//create animations for player
			self.Die.animation = new BABYLON.Animation("dieAnimation", "scaling", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
			// create keys
			var keys = [];
			var startScaling = entity.mesh.scaling;
			var endScaling = entity.mesh.scaling;
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
				value: endScaling.subtract(new BABYLON.Vector3(.5, .5, .5))
			});
			//Add keys to the animation object
			self.Die.animation.setKeys(keys);
			//Attach animation to player mesh
			//activeScene.player.mesh.animations.push(self.Die.animation);
		}
		this.start = function (activeScene, entity, dieFunction) {
			// Make sure no other animations are running
			if (entity.mesh.animatable) {
				entity.mesh.animatable.stop();
			}
			entity.action = entity.actionType.Die;
			self.animating = 1;
			//Attach animation to player mesh
			if (entity.mesh.animations == undefined) {
				entity.mesh.animations.push(self.Die.animation);
			}
			else {
				entity.mesh.animations[0] = self.Die.animation;
				//entity.mesh.animatable.stop();
			}
			entity.mesh.animatable = activeScene.beginAnimation(entity.mesh, 0, 30, false, 1.0, function () {
				entity.mesh.dispose();
				if (entity.mesh.actionManager) {
					entity.mesh.actionManager.actions = []; // remove actions
				} 
				// activeScene.activeRoom.enemy.splice(entity.index, 1);
				if (dieFunction != undefined) {
					dieFunction(); // execute Callback function
				}
			});
		}
		create(); // create animation
	};
	
	self.init = function (activeScene) {
		this.idle = new self.Idle(activeScene, entity);
		this.move = new self.Move(activeScene, entity);
		this.attack = new self.Attack(activeScene);
		this.die = new self.Die(activeScene, entity);
		this.takeDmg = new self.TakeDmg(activeScene);
	}
}