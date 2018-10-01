// create concept for units (enemies and player)
var Unit = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,

    initialize:

    function Unit(scene, x, y, texture, frame, type, hp, damage) {
        Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage
    },
    attack: function(target) {
        target.takeDamage(this.damage);
    },
    takeDamage: function(damage) {
        this.hp -= damage;
    }
});


// ---------------------- create enemy
var Enemy = new Phaser.Class({
    // UNIT is Enemy's prototype
    // Enemy inherit traits from Unit
    Extends: Unit,

    initialize:
    function Enemy(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
    }
});


// ---------------------- create main char
var PlayerCharacter = new Phaser.Class({
    Extends: Unit,

    initialize:
    function PlayerCharacter(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
        // flip the image so I don't have to edit it manually
        this.flipX = true;

        this.setScale(2);
    }
});











// ---------------------- create menu
var MenuItem = new Phaser.Class({
    Extends: Phaser.GameObjects.Text,

    initialize:

    function MenuItem(x, y, text, scene) {
        Phaser.GameObjects.Text.call(this, scene, x, y, text, { color: '#ffffff', align: 'left', fontSize: 15});
    },

    select: function() {
        this.setColor('#f8ff38');
    },

    deselect: function() {
        this.setColor('#ffffff');
    }

});



var Menu = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,

    initialize:

    function Menu(x, y, scene, heroes) {
        Phaser.GameObjects.Container.call(this, scene, x, y);
        this.menuItems = [];
        this.menuItemIndex = 0;
        this.heroes = heroes;
        this.x = x;
        this.y = y;
    },
    addMenuItem: function(unit) {
        var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
        this.menuItems.push(menuItem);
        this.add(menuItem);
    },
    moveSelectionUp: function() {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex--;
        if(this.menuItemIndex < 0)
            this.menuItemIndex = this.menuItems.length - 1;
        this.menuItems[this.menuItemIndex].select();
    },
    moveSelectionDown: function() {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex++;
        if(this.menuItemIndex >= this.menuItems.length)
            this.menuItemIndex = 0;
        this.menuItems[this.menuItemIndex].select();
    },
    // select the menu as a whole and an element with index from it
    select: function(index) {
        if(!index)
            index = 0;
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        this.menuItems[this.menuItemIndex].select();
    },
    // deselect this menu
    deselect: function() {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = 0;
    },
    confirm: function() {
        // wen the player confirms his slection, do the action
    },

    // removes all items from menuItems arr
    clear: function() {
        for(var i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].destroy();
        }
        this.menuItems.length = 0;
        this.menuItemIndex = 0;
    },

    // receives an array of units and will add them as MenuItems
    // through the addMenuItem method
    remap: function(units) {
        this.clear();
        for(var i = 0; i < units.length; i++) {
            var unit = units[i];
            this.addMenuItem(unit.type);
        }
    }
});


var HeroesMenu = new Phaser.Class({
    Extends: Menu,

    initialize:

    function HeroesMenu(x, y, scene) {
        Menu.call(this, x, y, scene);
    }
});

var ActionsMenu = new Phaser.Class({
    Extends: Menu,

    initialize:

    function ActionsMenu(x, y, scene) {
        Menu.call(this, x, y, scene);
        this.addMenuItem('Attack');
    },
    confirm: function() {
        // do something when the player selects an action
    }

});

var EnemiesMenu = new Phaser.Class({
    Extends: Menu,

    initialize:

    function EnemiesMenu(x, y, scene) {
        Menu.call(this, x, y, scene);
    },
    confirm: function() {
        // do something when the player selects an enemy
    }
});



var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },

    preload: function ()
    {
        // load resources
        this.load.spritesheet('player', 'assets/RPG_assets.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('dragonblue', 'assets/dragonblue.png');
        this.load.image('dragonorrange', 'assets/dragonorrange.png');
    },

    create: function ()
    {
        this.scene.start('BattleScene');
    }
});

var BattleScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function BattleScene ()
    {
        Phaser.Scene.call(this, { key: 'BattleScene' });
    },
    create: function ()
    {

        // change the background to green
        this.cameras.main.setBackgroundColor('rgba(0, 200, 0, 0.5)');

        // player character - warrior
        var warrior = new PlayerCharacter(this, 250, 50, 'player', 1, 'Warrior', 100, 20);
        this.add.existing(warrior);

        // player character - mage
        var mage = new PlayerCharacter(this, 250, 100, 'player', 4, 'Mage', 80, 8);
        this.add.existing(mage);

        // enemy - blue dragon
        var dragonblue = new Enemy(this, 50, 50, 'dragonblue', null, 'Dragon', 50, 3);
        this.add.existing(dragonblue);

        // enemy - orange dragon
        var dragonOrange = new Enemy(this, 50, 100, 'dragonorrange', null,'Dragon2', 50, 3);
        this.add.existing(dragonOrange);

        // array with heroes
        this.heroes = [ warrior, mage ];
        // array with enemies
        this.enemies = [ dragonblue, dragonOrange ];
        // array with both parties, who will attack
        this.units = this.heroes.concat(this.enemies);

        // Run UI Scene at the same time
        this.scene.launch('UIScene');

        this.index = -1;

    },


    nextTurn: function() {
        this.index++;
        // if there are no more units, we start again from the first one
        if(this.index >= this.units.length) {
            this.index = 0;
        }
        if(this.units[this.index]) {
            // if its player hero
            if(this.units[this.index] instanceof PlayerCharacter) {
                // emit playerSelect event
                this.events.emit('PlayerSelect', this.index);
            } else { // else if its enemy unit
                // pick random hero
                var r = Math.floor(Math.random() * this.heroes.length);
                // call the enemy's attack function
                this.units[this.index].attack(this.heroes[r]);
                // add timer for the next turn, so will have smooth gameplay
                this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
            }
        }
    }


});

var UIScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function UIScene ()
    {
        Phaser.Scene.call(this, { key: 'UIScene' });
    },

    create: function ()
    {
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, 0xffffff);
        this.graphics.fillStyle(0x031f4c, 1);
        this.graphics.strokeRect(2, 150, 90, 100);
        this.graphics.fillRect(2, 150, 90, 100);
        this.graphics.strokeRect(95, 150, 90, 100);
        this.graphics.fillRect(95, 150, 90, 100);
        this.graphics.strokeRect(188, 150, 130, 100);
        this.graphics.fillRect(188, 150, 130, 100);

        // basic container to hold all menus
        this.menus = this.add.container();

        this.heroesMenu = new HeroesMenu(195, 153, this);
        this.actionsMenu = new ActionsMenu(100, 153, this);
        this.enemiesMenu = new EnemiesMenu(8, 153, this);

        // the currently selected menu
        this.currentMenu = this.actionsMenu;

        // add menus to the container
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);

        // lets us have access to Battle Scene in UIScene
        this.battleScene = this.scene.get('BattleScene');

        this.remapHeroes();
        this.remapEnemies();

        // listen for keyboard events from user
        this.input.keyboard.on('keydown', this.onKeyInput, this);

        // listen for playerSelect event
        this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);

    },

    // when player select event is heard -- react!
    onPlayerSelect: function(id) {
       this.heroesMenu.select(id);
       this.actionsMenu.select(0);
       this.currentMenu = this.actionsMenu;
   },

    // these 2 methods allow us to call
    // remap method of Menu
    remapHeroes: function() {
        var heroes = this.battleScene.heroes;
        this.heroesMenu.remap(heroes);
    },
    remapEnemies: function() {
        var enemies = this.battleScene.enemies;
        this.enemiesMenu.remap(enemies);
    },

    onKeyInput: function(e) {
        if(this.currentMenu) {
            if(e.code === "ArrowUp") {
                this.currentMenu.moveSelectionUp();
            } else if(e.code === "ArrowDown") {
                this.currentMenu.moveSelectionDown();
            } else if(e.code === "ArrowRight" || e.code === "Shift") {

            } else if(e.code === "Space" || e.code === "ArrowLeft") {
                this.currentMenu.confirm();
            }
        }
    },


});

var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 320,
    height: 240,
    zoom: 2,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [ BootScene, BattleScene, UIScene ]
};

var game = new Phaser.Game(config);
























// ----------------------- code from part 1

// var BootScene = new Phaser.Class({
//
//     Extends: Phaser.Scene,
//
//     initialize: function BootScene() {
//         Phaser.Scene.call(this, {key: 'BootScene'});
//     },
//
//     preload: function() {
//         // load the resources here
//         // map tiles
//         this.load.image('tiles', 'assets/map/spritesheet.png');
//
//         // map in json format
//         this.load.tilemapTiledJSON('map', 'assets/map/map.json');
//
//         // our two characters
//         this.load.spritesheet('player', 'assets/RPG_assets.png', {
//             frameWidth: 16,
//             frameHeight: 16
//         });
//     },
//
//     create: function() {
//         this.scene.start('WorldScene');
//     }
// });
//
// var WorldScene = new Phaser.Class({
//
//     Extends: Phaser.Scene,
//
//     initialize: function WorldScene() {
//         Phaser.Scene.call(this, {key: 'WorldScene'});
//     },
//     preload: function() {},
//     create: function() {
//
//         // ---------------- the map ----------------
//
//         var map = this.make.tilemap({key: 'map'});
//         var tiles = map.addTilesetImage('spritesheet', 'tiles');
//
//         var grass = map.createStaticLayer('Grass', tiles, 0, 0);
//         var obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0);
//         obstacles.setCollisionByExclusion([-1]);
//
//
//
//
//
//
//         // ---------------- player ----------------
//
//         // creating our player
//         // (x-coord, y-coord, img resource, frame)
//         this.player = this.physics.add.sprite(50, 100, 'player', 6);
//
//         // make our person collide with stuff on map
//         this.physics.world.bounds.width = map.widthInPixels;
//         this.physics.world.bounds.height = map.heightInPixels;
//
//         // forces player to stay within bounds of
//         // the world!
//         this.player.setCollideWorldBounds(true);
//
//         // allows us to move player with arrow keys
//         this.cursors = this.input.keyboard.createCursorKeys();
//
//
//
//
//
//         // ---------------- camera ----------------
//
//         // make camera follow player as s/he
//         // traverses our map
//
//         // force camera to stay within bounds of map
//         this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
//
//         // makes camera follow player
//         this.cameras.main.startFollow(this.player);
//
//         // prevents tiles bleeding
//         // shows border lines on tiles.
//         this.cameras.main.roundPixels = true;
//
//
//
//
//
//
//
//
//         // ----------- animate player mvmts -----------
//
//
//         //  animation with key 'left', we don't need left and right as we will use one and flip the sprite
//         this.anims.create({
//             key: 'left',
//             frames: this.anims.generateFrameNumbers('player', { frames: [1, 7, 1, 13]}),
//             frameRate: 10,
//             repeat: -1
//         });
//
//         // animation with key 'right'
//         this.anims.create({
//             key: 'right',
//             frames: this.anims.generateFrameNumbers('player', { frames: [1, 7, 1, 13] }),
//             frameRate: 10,
//             repeat: -1
//         });
//         this.anims.create({
//             key: 'up',
//             frames: this.anims.generateFrameNumbers('player', { frames: [2, 8, 2, 14]}),
//             frameRate: 10,
//             repeat: -1
//         });
//         this.anims.create({
//             key: 'down',
//             frames: this.anims.generateFrameNumbers('player', { frames: [ 0, 6, 0, 12 ] }),
//             frameRate: 10,
//             repeat: -1
//         });
//
//         // make player collide with obstacles on map
//         this.physics.add.collider(this.player, obstacles);
//
//
//
//
//
//         // --------------- baddies ----------------
//
//         // create zones where we might encounter enemies
//         this.spawns = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
//         for(var i = 0; i < 30; i++) {
//             var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
//             var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
//             // parameters are x, y, width, height
//             this.spawns.create(x, y, 20, 20);
//         }
//
//         // allow player and enemy zones to interact
//         // when this interaction happens we call the
//         // onMeetEnemy method
//         this.physics.add.overlap(this.player, this.spawns, this.onMeetEnemy, false, this);
//     },
//
//     // this method runs whenever player interacts
//     // with zone object
//     // where enemies might spawn
//     onMeetEnemy: function(player, zone) {
//
//         // we move the zone to some other location
//         zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
//         zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
//
//         // shake the world when zone & player
//         // interact
//         this.cameras.main.shake(300);
//         // this.cameras.main.flash(100);
//         // this.cameras.main.fade(10);
//         // this.cameras.main.fade(0);
//
//         // start battle
//     },
//
//     update: function(time, delta) {
//
//
//
//         // ----------- player mvmt logic -----------
//
//         // set init v to 0
//         // bc player isn't moving!
//         this.player.body.setVelocity(0);
//
//         // Horizontal movement
//         if (this.cursors.left.isDown) {
//             this.player.body.setVelocityX(-80);
//         } else if (this.cursors.right.isDown) {
//             this.player.body.setVelocityX(80);
//         }
//
//         // Vertical movement
//         if (this.cursors.up.isDown) {
//             this.player.body.setVelocityY(-80);
//         } else if (this.cursors.down.isDown) {
//             this.player.body.setVelocityY(80);
//         }
//
//
//         // player walking animation
//         if (this.cursors.left.isDown) {
//             this.player.anims.play('left', true);
//             this.player.flipX = true;
//         }
//         else if (this.cursors.right.isDown) {
//             this.player.anims.play('right', true);
//             this.player.flipX = false;
//         }
//         else if (this.cursors.up.isDown) {
//             this.player.anims.play('up', true);
//         }
//         else if (this.cursors.down.isDown) {
//             this.player.anims.play('down', true);
//         }
//         else {
//             this.player.anims.stop();
//         }
//
//
//
//     }
// });
//
// var config = {
//     type: Phaser.AUTO,
//     parent: 'content',
//     width: 320,
//     height: 240,
//     zoom: 2,
//     pixelArt: true,
//     physics: {
//         default: 'arcade',
//         arcade: {
//             gravity: {
//                 y: 0
//             },
//             debug: true
//         }
//     },
//     scene: [BootScene, WorldScene]
// };
// var game = new Phaser.Game(config);















// ------------ complete code


// var BootScene = new Phaser.Class({
//
//     Extends: Phaser.Scene,
//
//     initialize:
//
//     function BootScene ()
//     {
//         Phaser.Scene.call(this, { key: "BootScene" });
//     },
//
//     preload: function ()
//     {
//         // load resources
//         this.load.spritesheet("player", "assets/RPG_assets.png", { frameWidth: 16, frameHeight: 16 });
//         this.load.image("dragonblue", "assets/dragonblue.png");
//         this.load.image("dragonorrange", "assets/dragonorrange.png");
//     },
//
//     create: function ()
//     {
//         this.scene.start("BattleScene");
//     }
// });
//
// var BattleScene = new Phaser.Class({
//
//     Extends: Phaser.Scene,
//
//     initialize:
//
//     function BattleScene ()
//     {
//         Phaser.Scene.call(this, { key: "BattleScene" });
//     },
//     create: function ()
//     {
//         // change the background to green
//         this.cameras.main.setBackgroundColor("rgba(0, 200, 0, 0.5)");
//
//         // player character - warrior
//         var warrior = new PlayerCharacter(this, 250, 50, "player", 1, "Warrior", 100, 20);
//         this.add.existing(warrior);
//
//         // player character - mage
//         var mage = new PlayerCharacter(this, 250, 100, "player", 4, "Mage", 80, 8);
//         this.add.existing(mage);
//
//         var dragonblue = new Enemy(this, 50, 50, "dragonblue", null, "Dragon", 50, 3);
//         this.add.existing(dragonblue);
//
//         var dragonOrange = new Enemy(this, 50, 100, "dragonorrange", null,"Dragon2", 50, 3);
//         this.add.existing(dragonOrange);
//
//         // array with heroes
//         this.heroes = [ warrior, mage ];
//         // array with enemies
//         this.enemies = [ dragonblue, dragonOrange ];
//         // array with both parties, who will attack
//         this.units = this.heroes.concat(this.enemies);
//
//         // Run UI Scene at the same time
//         this.scene.launch("UIScene");
//
//         this.index = -1;
//     },
//     nextTurn: function() {
//         this.index++;
//         // if there are no more units, we start again from the first one
//         if(this.index >= this.units.length) {
//             this.index = 0;
//         }
//         if(this.units[this.index]) {
//             // if its player hero
//             if(this.units[this.index] instanceof PlayerCharacter) {
//                 this.events.emit("PlayerSelect", this.index);
//             } else { // else if its enemy unit
//                 // pick random hero
//                 var r = Math.floor(Math.random() * this.heroes.length);
//                 // call the enemy"s attack function
//                 this.units[this.index].attack(this.heroes[r]);
//                 // add timer for the next turn, so will have smooth gameplay
//                 this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
//             }
//         }
//     },
//     // when the player have selected the enemy to be attacked
//     receivePlayerSelection: function(action, target) {
//         if(action == "attack") {
//             this.units[this.index].attack(this.enemies[target]);
//         }
//         // next turn in 3 seconds
//         this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
//     }
// });
//
// // base class for heroes and enemies
// var Unit = new Phaser.Class({
//     Extends: Phaser.GameObjects.Sprite,
//
//     initialize:
//
//     function Unit(scene, x, y, texture, frame, type, hp, damage) {
//         Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
//         this.type = type;
//         this.maxHp = this.hp = hp;
//         this.damage = damage; // default damage
//     },
//     attack: function(target) {
//         target.takeDamage(this.damage);
//         this.scene.events.emit("Message", this.type + " attacks " + target.type + " for " + this.damage + " damage");
//     },
//     takeDamage: function(damage) {
//         this.hp -= damage;
//         if(this.hp <= 0) {
//             this.hp = 0;
//             this.alive = false;
//         }
//     }
// });
//
// var Enemy = new Phaser.Class({
//     Extends: Unit,
//
//     initialize:
//     function Enemy(scene, x, y, texture, frame, type, hp, damage) {
//         Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
//     }
// });
//
// var PlayerCharacter = new Phaser.Class({
//     Extends: Unit,
//
//     initialize:
//     function PlayerCharacter(scene, x, y, texture, frame, type, hp, damage) {
//         Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
//         // flip the image so I don"t have to edit it manually
//         this.flipX = true;
//
//         this.setScale(2);
//     }
// });
//
// var MenuItem = new Phaser.Class({
//     Extends: Phaser.GameObjects.Text,
//
//     initialize:
//
//     function MenuItem(x, y, text, scene) {
//         Phaser.GameObjects.Text.call(this, scene, x, y, text, { color: "#ffffff", align: "left", fontSize: 15});
//     },
//
//     select: function() {
//         this.setColor("#f8ff38");
//     },
//
//     deselect: function() {
//         this.setColor("#ffffff");
//     }
//
// });
//
// var Menu = new Phaser.Class({
//     Extends: Phaser.GameObjects.Container,
//
//     initialize:
//
//     function Menu(x, y, scene, heroes) {
//         Phaser.GameObjects.Container.call(this, scene, x, y);
//         this.menuItems = [];
//         this.menuItemIndex = 0;
//         this.heroes = heroes;
//         this.x = x;
//         this.y = y;
//     },
//     addMenuItem: function(unit) {
//         var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
//         this.menuItems.push(menuItem);
//         this.add(menuItem);
//     },
//     moveSelectionUp: function() {
//         this.menuItems[this.menuItemIndex].deselect();
//         this.menuItemIndex--;
//         if(this.menuItemIndex < 0)
//             this.menuItemIndex = this.menuItems.length - 1;
//         this.menuItems[this.menuItemIndex].select();
//     },
//     moveSelectionDown: function() {
//         this.menuItems[this.menuItemIndex].deselect();
//         this.menuItemIndex++;
//         if(this.menuItemIndex >= this.menuItems.length)
//             this.menuItemIndex = 0;
//         this.menuItems[this.menuItemIndex].select();
//     },
//     // select the menu as a whole and an element with index from it
//     select: function(index) {
//         if(!index)
//             index = 0;
//         this.menuItems[this.menuItemIndex].deselect();
//         this.menuItemIndex = index;
//         this.menuItems[this.menuItemIndex].select();
//     },
//     // deselect this menu
//     deselect: function() {
//         this.menuItems[this.menuItemIndex].deselect();
//         this.menuItemIndex = 0;
//     },
//     confirm: function() {
//         // wen the player confirms his slection, do the action
//     },
//     clear: function() {
//         for(var i = 0; i < this.menuItems.length; i++) {
//             this.menuItems[i].destroy();
//         }
//         this.menuItems.length = 0;
//         this.menuItemIndex = 0;
//     },
//     remap: function(units) {
//         this.clear();
//         for(var i = 0; i < units.length; i++) {
//             var unit = units[i];
//             this.addMenuItem(unit.type);
//         }
//     }
// });
//
// var HeroesMenu = new Phaser.Class({
//     Extends: Menu,
//
//     initialize:
//
//     function HeroesMenu(x, y, scene) {
//         Menu.call(this, x, y, scene);
//     }
// });
//
// var ActionsMenu = new Phaser.Class({
//     Extends: Menu,
//
//     initialize:
//
//     function ActionsMenu(x, y, scene) {
//         Menu.call(this, x, y, scene);
//         this.addMenuItem("Attack");
//     },
//     confirm: function() {
//         this.scene.events.emit("SelectEnemies");
//     }
//
// });
//
// var EnemiesMenu = new Phaser.Class({
//     Extends: Menu,
//
//     initialize:
//
//     function EnemiesMenu(x, y, scene) {
//         Menu.call(this, x, y, scene);
//     },
//     confirm: function() {
//         this.scene.events.emit("Enemy", this.menuItemIndex);
//     }
// });
//
// var UIScene = new Phaser.Class({
//
//     Extends: Phaser.Scene,
//
//     initialize:
//
//     function UIScene ()
//     {
//         Phaser.Scene.call(this, { key: "UIScene" });
//     },
//
//     create: function ()
//     {
//         this.graphics = this.add.graphics();
//         this.graphics.lineStyle(1, 0xffffff);
//         this.graphics.fillStyle(0x031f4c, 1);
//         this.graphics.strokeRect(2, 150, 90, 100);
//         this.graphics.fillRect(2, 150, 90, 100);
//         this.graphics.strokeRect(95, 150, 90, 100);
//         this.graphics.fillRect(95, 150, 90, 100);
//         this.graphics.strokeRect(188, 150, 130, 100);
//         this.graphics.fillRect(188, 150, 130, 100);
//
//         // basic container to hold all menus
//         this.menus = this.add.container();
//
//         this.heroesMenu = new HeroesMenu(195, 153, this);
//         this.actionsMenu = new ActionsMenu(100, 153, this);
//         this.enemiesMenu = new EnemiesMenu(8, 153, this);
//
//         // the currently selected menu
//         this.currentMenu = this.actionsMenu;
//
//         // add menus to the container
//         this.menus.add(this.heroesMenu);
//         this.menus.add(this.actionsMenu);
//         this.menus.add(this.enemiesMenu);
//
//         this.battleScene = this.scene.get("BattleScene");
//
//         this.remapHeroes();
//         this.remapEnemies();
//
//         this.input.keyboard.on("keydown", this.onKeyInput, this);
//
//         this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);
//
//         this.events.on("SelectEnemies", this.onSelectEnemies, this);
//
//         this.events.on("Enemy", this.onEnemy, this);
//
//         this.message = new Message(this, this.battleScene.events);
//         this.add.existing(this.message);
//
//         this.battleScene.nextTurn();
//     },
//     onEnemy: function(index) {
//         this.heroesMenu.deselect();
//         this.actionsMenu.deselect();
//         this.enemiesMenu.deselect();
//         this.currentMenu = null;
//         this.battleScene.receivePlayerSelection("attack", index);
//     },
//     onPlayerSelect: function(id) {
//         this.heroesMenu.select(id);
//         this.actionsMenu.select(0);
//         this.currentMenu = this.actionsMenu;
//     },
//     onSelectEnemies: function() {
//         this.currentMenu = this.enemiesMenu;
//         this.enemiesMenu.select(0);
//     },
//     remapHeroes: function() {
//         var heroes = this.battleScene.heroes;
//         this.heroesMenu.remap(heroes);
//     },
//     remapEnemies: function() {
//         var enemies = this.battleScene.enemies;
//         this.enemiesMenu.remap(enemies);
//     },
//     onKeyInput: function(event) {
//         if(this.currentMenu) {
//             if(event.code === "ArrowUp") {
//                 this.currentMenu.moveSelectionUp();
//             } else if(event.code === "ArrowDown") {
//                 this.currentMenu.moveSelectionDown();
//             } else if(event.code === "ArrowRight" || event.code === "Shift") {
//
//             } else if(event.code === "Space" || event.code === "ArrowLeft") {
//                 this.currentMenu.confirm();
//             }
//         }
//     },
// });
//
// var Message = new Phaser.Class({
//
//     Extends: Phaser.GameObjects.Container,
//
//     initialize:
//     function Message(scene, events) {
//         Phaser.GameObjects.Container.call(this, scene, 160, 30);
//         var graphics = this.scene.add.graphics();
//         this.add(graphics);
//         graphics.lineStyle(1, 0xffffff, 0.8);
//         graphics.fillStyle(0x031f4c, 0.3);
//         graphics.strokeRect(-90, -15, 180, 30);
//         graphics.fillRect(-90, -15, 180, 30);
//         this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: "#ffffff", align: "center", fontSize: 13, wordWrap: { width: 160, useAdvancedWrap: true }});
//         this.add(this.text);
//         this.text.setOrigin(0.5);
//         events.on("Message", this.showMessage, this);
//         this.visible = false;
//     },
//     showMessage: function(text) {
//         this.text.setText(text);
//         this.visible = true;
//         if(this.hideEvent)
//             this.hideEvent.remove(false);
//         this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideMessage, callbackScope: this });
//     },
//     hideMessage: function() {
//         this.hideEvent = null;
//         this.visible = false;
//     }
// });
//
// var config = {
//     type: Phaser.AUTO,
//     parent: "content",
//     width: 320,
//     height: 240,
//     zoom: 2,
//     pixelArt: true,
//     physics: {
//         default: "arcade",
//         arcade: {
//             gravity: { y: 0 }
//         }
//     },
//     scene: [ BootScene, BattleScene, UIScene ]
// };
//
// var game = new Phaser.Game(config);
