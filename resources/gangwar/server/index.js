import * as alt from "alt-server";
import * as chat from "chat";
import fs from "fs";
import {resolve, dirname} from "path";
import axios from "axios";

let currentTurf = null;
const currentTurfPoints = {
    ballas: 0,
    families: 0,
    vagos: 0,
};
class Turf {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    
    between(min, p, max) {
        let result = false;
        
        if (min < max) {
            if (p > min && p < max) {
                result = true;
            }
        }
        
        if (min > max) {
            if (p > max && p < min) {
                result = true;
            }
        }
        
        if (p == min || p == max) {
            result = true;
        }
        return result;
    }
    
    contains(x, y) {
        let result = false;
        if (this.between(this.x1, x, this.x2) && this.between(this.y1, y, this.y2)) {
            result = true;
        }
        return result;
    }
}

/**
 * Admins, Rockstar Social Club ID
 * @type {string[]}
 */
const admins = [
    '311182406' // Sergio
];
const vehicles = {
    ballas: [
        "scorcher",
        "bati",
        "faggio",
        "esskey",
        "buccaneer",
        "chino2",
        "clique",
        "coquette3",
        "dominator3",
        "dukes",
        "faction3",
        "hotknife",
        "slamvan3",
        "stalion2",
        "bifta",
        "blazer",
        "dubsta3",
        "kalahari",
        "dloader",
        "sandking2",
        "outlaw",
        "blazer3",
        "vagrant",
        "baller2",
        "baller5",
        "asea",
        "asea2",
        "asterope",
        "cog55",
        "cog552",
        "glendale",
        "ingot",
        "limo2",
        "primo",
        "warrener",
        "bus",
        "coach",
        "rallytruck",
        "rentalbus",
        "trash",
        "deveste",
        "coquette4",
        "ninef2",
        "paragon2",
        "tampa2",
        "tornado6",
        "t20",
        "tezeract",
        "vigilante",
        "zentorno",
        "caddy2",
        "caddy",
        "docktug",
        "forklift",
        "mower",
        "airtug",
        "tractor3",
        "tractor2"
    ],
    families: ["police3", "police4", "sheriff2", "riot"],
    vagos:
        [
            "scorcher",
            "bati",
            "faggio",
            "esskey",
            "buccaneer",
            "chino2",
            "clique",
            "coquette3",
            "dominator3",
            "dukes",
            "faction3",
            "hotknife",
            "slamvan3",
            "stalion2",
            "bifta",
            "blazer",
            "dubsta3",
            "kalahari",
            "dloader",
            "sandking2",
            "outlaw",
            "blazer3",
            "vagrant",
            "baller2",
            "baller5",
            "asea",
            "asea2",
            "asterope",
            "cog55",
            "cog552",
            "glendale",
            "ingot",
            "limo2",
            "primo",
            "warrener",
            "bus",
            "coach",
            "rallytruck",
            "rentalbus",
            "trash",
            "deveste",
            "coquette4",
            "ninef2",
            "paragon2",
            "tampa2",
            "tornado6",
            "t20",
            "tezeract",
            "vigilante",
            "zentorno",
            "caddy2",
            "caddy",
            "docktug",
            "forklift",
            "mower",
            "airtug",
            "tractor3",
            "tractor2"
        ],
};
const weapons = {
    WEAPON_KNIFE: "Knife",
    WEAPON_BAT: "Bat",
    WEAPON_BOTTLE: "Bottle",
    WEAPON_WRENCH: "Wrench",
    WEAPON_PISTOL: "Pistol",
    WEAPON_HEAVYPISTOL: "Heavy pistol",
    WEAPON_REVOLVER: "Revolver",
    WEAPON_MICROSMG: "Micro-SMG",
    WEAPON_SMG: "SMG",
    WEAPON_COMBATPDW: "Combat PDW",
    WEAPON_ASSAULTRIFLE: "Assault Rifle",
    WEAPON_CARBINERIFLE: "Carbin Rifle",
    WEAPON_PUMPSHOTGUN: "Pump Shotgun",
    WEAPON_GRENADE: "Grenade",
    WEAPON_RAMMED_BY_CAR: "Jumped out of car",
    WEAPON_RUN_OVER_BY_CAR: "Run over by car",
    WEAPON_FALL: "Fall",
    WEAPON_DROWNING: "Drowning",
    WEAPON_DROWNING_IN_VEHICLE: "Drowning",
    WEAPON_EXPLOSION: "Explosion",
    WEAPON_FIRE: "Fired",
    WEAPON_BLEEDING: "Bleeding",
    WEAPON_BARBED_WIRE: "Barbed wire",
    WEAPON_EXHAUSTION: "Exhaustion",
    WEAPON_ELECTRIC_FENCE: "Electric fence",
};
const colors = {
    ballas: {
        rgba: {r: 96, g: 96, b: 96, a: 150},
        hex: "606060",
    },
    families: {
        rgba: {r: 0, g: 127, b: 0, a: 150},
        hex: "008000",
    },
    vagos: {
        rgba: {r: 49, g: 49, b: 148, a: 150},
        hex: "313195",
    },
};
const positions = {
    vagos: {
        spawns: [
            {x: 334.6681, y: -2052.6726, z: 20.8212},
            {x: 341.789, y: -2051.3669, z: 21.3267},
            {x: 345.7582, y: -2044.6812, z: 21.63},
            {x: 342.3955, y: -2040.356, z: 21.5626},
            {x: 351.2835, y: -2043.2043, z: 22.0007},
        ],
        vehicle: {x: 330.9758, y: -2036.6241, z: 20.9897},
    },
    ballas: {
        spawns: [
            {x: 88.6285, y: -1959.389, z: 20.737},
            {x: 109.3054, y: -1955.8022, z: 20.737},
            {x: 117.7318, y: -1947.7583, z: 20.72},
            {x: 118.9186, y: -1934.2681, z: 20.7707},
            {x: 105.7318, y: -1923.4154, z: 20.737},
        ],
        vehicle: {x: 105.7186, y: -1941.5867, z: 20.7875},
    },
    families: {
        spawns: [
            {x: -196.4439, y: -1607.0505, z: 34.1494},
            {x: -174.356, y: -1609.978, z: 33.7281},
            {x: -175.0681, y: -1623.1647, z: 33.5596},
            {x: -191.1692, y: -1641.4813, z: 33.408},
            {x: -183.5736, y: -1587.5999, z: 34.8234},
        ],
        vehicle: {x: -183.5736, y: -1587.5999, z: 34.8234},
    },
};
const checkpoints = {
    ballas: {
        vehicle: null
    },
    families: {
        vehicle: null
    },
    vagos: {
        vehicle: null
    },
};
const weaponHashes = {};
const availableWeapons = ["WEAPON_KNIFE", "WEAPON_HEAVYPISTOL"];
const player_statistics = {};
const AMOUNT_MINPLAYER_STARTTURF = 1;

/**
 * Creating initial Checkpoints
 */
for (let i in positions) {
    checkpoints[i].vehicle = new alt.Checkpoint(45, positions[i].vehicle.x, positions[i].vehicle.y, positions[i].vehicle.z - 1.1, 5, 1, colors[i].rgba.r, colors[i].rgba.g, colors[i].rgba.b, 255);
}

/**
 * Filling weapon hashes
 */
for (let w in weapons) {
    weaponHashes[alt.hash(w)] = weapons[w];
}

function giveWeapons(player) {
    for (const weapon of availableWeapons) {
        player.giveWeapon(alt.hash(weapon), 9999, true);
    }
    player.health = 200;
    player.armour = 100;
}

function startCapture(turf) {
    currentTurfPoints.ballas = 0;
    currentTurfPoints.families = 0;
    currentTurfPoints.vagos = 0;
    
    currentTurf = turf;
    alt.emitAllClients("captureStateChanged", true);
    alt.emitAllClients("startCapture", {
        x1: currentTurf.x1,
        y1: currentTurf.y1,
        x2: currentTurf.x2,
        y2: currentTurf.y2,
    });
    alt.emitAllClients("updateTeamPoints", currentTurfPoints);
    
    // -> Reset Statistics
    for (let player_name in player_statistics) {
        if (player_statistics.hasOwnProperty(player_name)) {
            for (let player_stat_key in Object.keys(player_statistics[player_name])) {
                player_statistics[player_name][player_stat_key] = 0;
            }
        }
    }
}
function stopCapture() {
    if (currentTurf) {
        currentTurfPoints.ballas = 0;
        currentTurfPoints.families = 0;
        currentTurfPoints.vagos = 0;
        currentTurf = null;
        alt.emitAllClients("captureStateChanged", false);
        alt.emitAllClients("stopCapture");
    
        sendStatisticsToDiscord();
    }
}

alt.setInterval(() => {
    if (currentTurf) {
        let allPlayers = alt.Player.all;
        
        for (let p of allPlayers) {
            if (!p.valid) {
                continue;
            }
            const pTeam = p.getMeta("team");
            if (!pTeam) {
                continue;
            }
            if (currentTurf.contains(p.pos.x, p.pos.y)) {
                currentTurfPoints[pTeam]++;
                if (currentTurfPoints[pTeam] >= 1000) {
                    chat.broadcast(`{${colors[pTeam].hex}} ${pTeam} {FFFFFF}got this turf.`);
                    stopCapture();
                    return;
                }
            }
        }
        alt.emitAllClients("updateTeamPoints", currentTurfPoints);
    }
    
}, 1000);

function getTeamsPopulation() {
    const population = {
        ballas: 0,
        families: 0,
        vagos: 0,
    };
    for (let p of alt.Player.all) {
        const team = p.getMeta("team");
        if (team) {
            population[team]++;
        }
    }
    return population;
}

function broadcastTeamsPopulation() {
    for (let p of alt.Player.all) {
        if (p.getMeta("selectingTeam")) {
            alt.emitClient(p, "showTeamSelect", getTeamsPopulation());
        }
    }
}

function broadcastPlayersOnline(add) {
    if (add !== undefined) {
        alt.emitAllClients("updatePlayersOnline", alt.Player.all.length + add);
    } else {
        alt.emitAllClients("updatePlayersOnline", alt.Player.all.length);
    }
}

function sendStatisticsToDiscord() {
    
    let player_stats_array = [];
    for (let player_name in player_statistics) {
        if (player_statistics.hasOwnProperty(player_name)) {
            
            let player_stats_obj = player_statistics[player_name];
            player_stats_array.push({
                "color": null,
                "author": {
                    "name": player_name
                },
                "fields": [
                    {
                        "name": "Armor used:",
                        "value": player_stats_obj.amount_used_armour
                    },
                    {
                        "name": "Heal used:",
                        "value": player_stats_obj.amount_used_heal
                    },
                    {
                        "name": "HP Reg",
                        "value": player_stats_obj.amount_healed_for
                    },
                    {
                        "name": "Damage Dealt:",
                        "value": player_stats_obj.amount_dmg_given
                    },
                    {
                        "name": "Damage Taken:",
                        "value": player_stats_obj.amount_dmg_taken
                    },
                    {
                        "name": "Deaths:",
                        "value": player_stats_obj.amount_deaths
                        
                    },
                    {
                        "name": "Shots fired:",
                        //"_value": player_stats_obj.amount_shots_fired,
                        "value": "Not working yet..."
                    }
                ],
            });
        }
    }
    
    axios.post('https://discord.com/api/webhooks/877618409506996284/zdh6cs9qVuBc8Y7HheZhwx_1ODlz5ayXtGE9ih_lMy0WRT1G-f9LYm7KBr4socv96mvj', {
        "content": "Player Stats:",
        "embeds": player_stats_array
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

//<editor-fold defaultstate="collapsed" desc="-> Commands">
chat.registerCmd("kick", (player, args) => {
    if (player.getMeta("admin")) {
        if (args.length > 0) {
            let players = alt.Player.all.filter((p) => p.name === args.join(" "));
            if (players.length != 0) {
                for (const p of players) {
                    chat.send(p, `{FF0000}You was kicked from the server`);
                    chat.broadcast(`{5555AA}${p.name} {FFFFFF}kicked`);
                    p.kick("You was kicked from the server");
                }
            } else {
                for (const p of players) {
                    if (p.name.startsWith(args.join(" "))) {
                        chat.send(p, `{FF0000}You was kicked from the server`);
                        chat.broadcast(`{5555AA}${p.name} {FFFFFF}kicked`);
                        p.kick("You was kicked from the server");
                    }
                }
            }
        }
    } else {
        chat.send(player, "{FF5733}You don`t have enough permissions to use this command!");
    }
});

chat.registerCmd("ban", (player, args) => {
    if (player.getMeta("admin")) {
        if (args.length > 0) {
            let players = alt.Player.all.filter((p) => p.name === args.join(" "));
            
            if (players.length != 0) {
                for (const p of players) {
                    chat.send(p, `{FF0000}You was banned from the server`);
                    chat.broadcast(`{5555AA}${p.name} {FFFFFF}banned`);
                    addToBlacklist(p.getMeta("licenseHash"));
                    const discordId = p.getMeta("discordId");
                    if (discordId) {
                        addToBlacklist(discordId);
                    }
                    p.kick("You was banned from the server");
                }
            } else {
                for (const p of players) {
                    if (p.name.startsWith(args.join(" "))) {
                        chat.send(p, `{FF0000}You was banned from the server`);
                        chat.broadcast(`{5555AA}${p.name} {FFFFFF}banned`);
                        addToBlacklist(p.getMeta("licenseHash"));
                        const discordId = p.getMeta("discordId");
                        if (discordId) {
                            addToBlacklist(discordId);
                        }
                        p.kick("You was banned from the server");
                    }
                }
            }
        }
    } else {
        chat.send(player, "{FF5733}You don`t have enough permissions to use this command!");
    }
});

chat.registerCmd('addTurf', (player, args) => {
    if (!player.getMeta("admin")) {
        chat.send(player, "{FF5733}You don`t have enough permissions to use this command!");
        return;
    }
    if (AMOUNT_MINPLAYER_STARTTURF > alt.Player.all.length) {
        chat.send(player, "{FF5733}Not enough players to add a Turf!");
        return;
    }
    
    let targetX = player.pos.x, targetY = player.pos.y;
    startCapture(new Turf(targetX - 100, targetY + 100, targetX + 100, targetY - 100));
});
chat.registerCmd('stopTurf', (player, args) => {
    if (!player.getMeta("admin")) {
        chat.send(player, "{FF5733}You don`t have enough permissions to use this command!");
        return;
    }
    
    stopCapture();
});
chat.registerCmd('setTeamSpawn', (player, args) => {
    if (args.length <= 0 || args[0] !== 'ms14') {
        return; // -> /addTurf ms14
    }
    
    //stopCapture();
});
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="-> altV Server-Events">
alt.on("playerConnect", (player) => {
    player.setMeta("selectingTeam", true);
    player.setMeta("checkpoint", 0);
    player.setMeta("vehicle", null);
    player.setMeta("canSpawnVehicle", 0);
    player.setMeta("warns", 0);
    
    alt.log(`Social-ID: ${player.socialID} with Player-Name ${player.name}`);
    let isAdmin = admins.includes(player.socialID);
    player.setMeta("admin", isAdmin);
    
    player_statistics[player.name] = {
        amount_used_heal: 0,
        amount_used_armour: 0,
        amount_healed_for: 0,
        amount_dmg_taken: 0,
        amount_dmg_given: 0,
        amount_shots_fired: 0,
        amount_deaths: 0
    };
    
    broadcastPlayersOnline();
    
    chat.broadcast(`{5555AA}${player.name} {FFFFFF}connected`);
    alt.log((isAdmin ? "Admin " : "Player ") + `${player.name} connected`);
    
    alt.emitClient(player, "youAreConnected");
});

alt.on("playerDisconnect", (player) => {
    const veh = player.getMeta("vehicle");
    if (veh) {
        veh.destroy();
    }
    
    player.setMeta("selectingTeam", false);
    if (player_statistics[player.name]) {
        delete player_statistics[player.name];
    }
    
    broadcastTeamsPopulation();
    broadcastPlayersOnline(-1);
    
    chat.broadcast(`{5555AA}${player.name} {FFFFFF}disconnected`);
    alt.log(`${player.name} disconnected`);
});

alt.onClient("teamSelected", (player, teamId) => {
    let team = "families";
    if (teamId == 2) {
        team = "ballas";
    } else if (teamId == 3) {
        team = "vagos";
    }
    
    player.setMeta("team", team);
    player.setMeta("selectingTeam", false);
    broadcastTeamsPopulation();
    
    chat.broadcast(`{5555AA}${player.name} {FFFFFF}joined {${colors[team].hex}}${team}`);
    
    alt.log(player.name + " joined " + team);
    const nextSpawns = positions[team].spawns;
    
    const spawn = nextSpawns[Math.round(Math.random() * (nextSpawns.length - 1))];
    console.log("Spawning in " + JSON.stringify(spawn));
    player.model = "mp_m_freemode_01";
    player.spawn(spawn.x, spawn.y, spawn.z, 0);
    giveWeapons(player);
    
    alt.emitClient(player, "applyAppearance", team);
    alt.emitClient(player, "updateTeam", team);
    
    if (currentTurf != null) {
        alt.emitAllClients("captureStateChanged", true);
        alt.emitAllClients("startCapture", {
            x1: Math.min(currentTurf.x1, currentTurf.x2),
            y1: Math.min(currentTurf.y1, currentTurf.y2),
            x2: Math.max(currentTurf.x1, currentTurf.x2),
            y2: Math.max(currentTurf.y1, currentTurf.y2),
        });
        alt.emitAllClients("updateTeamPoints", currentTurfPoints);
    }
});

alt.onClient("action", (player) => {
    const cp = player.getMeta("checkpoint");
    if (cp === 1) {
        const nextTimeSpawn = player.getMeta("canSpawnVehicle");
        if (nextTimeSpawn > Date.now()) {
            return;
        }
        
        const pTeam = player.getMeta("team");
        const pos = player.pos;
        let curVeh = player.getMeta("vehicle");
        if (curVeh) {
            curVeh.destroy();
            curVeh = null;
        }
        
        const nextModel = vehicles[pTeam][Math.round(Math.random() * (vehicles[pTeam].length - 1))];
        const vehColor = colors[pTeam].rgba;
        curVeh = new alt.Vehicle(nextModel, pos.x + 2, pos.y, pos.z, 0, 0, 0);
        curVeh.customPrimaryColor = {r: vehColor.r, g: vehColor.g, b: vehColor.b};
        curVeh.customSecondaryColor = {r: vehColor.r, g: vehColor.g, b: vehColor.b};
        player.setMeta("vehicle", curVeh);
        player.setMeta("canSpawnVehicle", Date.now() + 400);
    }
});

alt.on("entityEnterColshape", (colshape, entity) => {
    if (entity instanceof alt.Player) {
        const pTeam = entity.getMeta("team");
        
        if (checkpoints[pTeam] && colshape === checkpoints[pTeam].vehicle) {
            entity.setMeta("checkpoint", 1);
            alt.emitClient(entity, "showInfo", "~INPUT_PICKUP~ to get car");
        }
    }
});

alt.on("entityLeaveColshape", (colshape, entity) => {
    if (entity instanceof alt.Player) {
        entity.setMeta("checkpoint", 0);
    }
});

alt.on("playerDeath", (player, killer, weapon) => {
    let weaponName = "Killed";
    if (weapon in weaponHashes) {
        weaponName = weaponHashes[weapon];
    }
    
    if (player == killer && weaponName == "Killed") {
        weaponName = "Suicided";
    } else if (weaponName == "Killed") {
        console.log("Unknown death reason: " + weapon.toString(16));
    }
    
    const team = player.getMeta("team");
    if (!killer) {
        killer = player;
    }
    
    // Fill Statistic
    player_statistics[player.name].amount_deaths += 1;
    
    const nextSpawns = positions[team].spawns;
    const spawnPos = nextSpawns[Math.round(Math.random() * (nextSpawns.length - 1))];
    player.spawn(spawnPos.x, spawnPos.y, spawnPos.z, 5000);
    
    if (killer) {
        const killerTeam = killer.getMeta("team");
        alt.emitAllClients("playerKill", {
            killerName: killer.name,
            killerGang: killerTeam,
            victimName: player.name,
            victimGang: team,
            weapon: weaponName
        });
        
        if (currentTurf != null && killer != player && team != killerTeam) {
            if (currentTurf.contains(player.pos.x, player.pos.y)) {
                currentTurfPoints[killerTeam] += 50;
                if (currentTurfPoints[killerTeam] >= 1000) {
                    chat.broadcast(`{${colors[killerTeam].hex}} ${killerTeam} {FFFFFF}got this turf. Next capture started`);
                    stopCapture();
                }
            }
        } else if (currentTurf != null && team == killerTeam) {
            if (currentTurf.contains(player.pos.x, player.pos.y)) {
                if (currentTurfPoints[killerTeam] > 50) {
                    currentTurfPoints[killerTeam] -= 50;
                } else {
                    currentTurfPoints[killerTeam] = 0;
                }
            }
        }
        
        if (team == killerTeam && player != killer) {
            let warns = killer.getMeta("warns");
            if (warns == 2) {
                chat.broadcast(`{5555AA}${killer.name} {AA0000}kicked for team killing`);
                killer.kick();
            } else {
                chat.broadcast(`{5555AA}${killer.name} {AA0000}warned [${warns + 1}/3] for team killing`);
                killer.setMeta("warns", warns + 1);
            }
        } else if (player != killer && weaponName == weapons.WEAPON_RUN_OVER_BY_CAR) {
            let warns = killer.getMeta("warns");
            if (warns == 2) {
                chat.broadcast(`{5555AA}${killer.name} {AA0000}kicked for vehicle kill`);
                killer.kick();
            } else {
                chat.broadcast(`{5555AA}${killer.name} {AA0000}warned [${warns + 1}/3] for vehicle kill`);
                killer.setMeta("warns", warns + 1);
            }
        }
    }
});

alt.on('weaponDamage', (attacker, victim, weaponHash, damage, offset, bodyPart) => {
    // 20 = headshot
    // chat.broadcast(`weaponDamage Bodypart: ${bodyPart}`);
    // chat.broadcast(`weaponDamage Damage: ${damage}`);
    
    if (attacker instanceof alt.Player) {
        // Fill Statistic
        player_statistics[attacker.name].amount_dmg_given += damage;
    }
    if (victim instanceof alt.Player) {
        // Fill Statistic
        player_statistics[victim.name].amount_dmg_taken += damage;
    }
    
});

alt.on('startFire', (player, fires) => {
    alt.log('startFire: ' + player.name);
});

alt.on('startProjectile', (player, pos, dir, ammoHash, weaponHash) => {
    alt.log('startProjectile: ' + player.name);
});
//</editor-fold>

//<editor-fold defaultstate="collapsed" desc="-> Client Events">

let HealArmourDuration = 5000;
alt.onClient("onPlayerHeal", (player) => {
    if (player.getMeta("playerHealing") === true) {
        return;
    }
    if (player.getMeta("playerArmour") === true) {
        return;
    }
    
    player.setMeta("playerHealing", true);
    alt.emitClient(player, 'animation:Play', {
        dict: 'amb@medic@standing@kneel@base', name: 'base', duration: HealArmourDuration, flag: 1
    });
    
    setTimeout(function (player) {
        let beforeHealth = player.health;
        
        player.health = 200;
        player.setMeta("playerHealing", undefined);
    
        player_statistics[player.name].amount_used_heal += 1;
        player_statistics[player.name].amount_healed_for += (player.health - beforeHealth);
        
    }, HealArmourDuration, player);
});
alt.onClient("onPlayerArmour", (player) => {
    if (player.getMeta("playerHealing") === true) {
        return;
    }
    if (player.getMeta("playerArmour") === true) {
        return;
    }
    
    player.setMeta("playerArmour", true);
    alt.emitClient(player, 'animation:Play', {
        dict: 'amb@medic@standing@kneel@base', name: 'base', duration: HealArmourDuration, flag: 1
    });
    
    setTimeout(function (player) {
        player.armour = 100;
        player.setMeta("playerArmour", undefined);
    
        player_statistics[player.name].amount_used_armour += 1;
    }, HealArmourDuration, player);
});

alt.onClient("viewLoaded", (player) => {
    alt.log("View loaded for " + player.name);
    alt.emitClient(player, "showTeamSelect", getTeamsPopulation());
    alt.emitClient(player, "updatePlayersOnline", alt.Player.all.length);
});

alt.onClient("authData", (player, data) => {
    const licenseHash = data.sc;
    player.setMeta("licenseHash", licenseHash);
    let dsInfo = null;
    if (data.discord && data.discord.id) {
        dsInfo = data.discord.id;
        player.setMeta("discordId", dsInfo);
    }
    if (licenseHash in blacklistData || (dsInfo !== null && dsInfo in blacklistData)) {
        chat.broadcast(`{5555AA}${player.name} {FFFFFF}kicked (Blacklisted)`);
        player.kick();
    }
});

//</editor-fold>

function getDistanceBetweenPoints(pos1, pos2) {
    const dX = pos1.x - pos2.x;
    const dY = pos1.y - pos2.y;
    const dZ = pos1.z - pos2.z;
    return Math.sqrt(dX * dX + dY * dY + dZ * dZ);
}

/**
 * AFK Check
 */
alt.setInterval(() => {
    for (let p of alt.Player.all) {
        if (!p.valid) {
            continue;
        }
        const lastPos = p.getMeta("lastPos");
        if (lastPos) {
            if (getDistanceBetweenPoints(lastPos, p.pos) <= 1) {
                chat.broadcast(`${p.name} {FFFFFF}was kicked for being AFK`);
                p.kick();
            } else {
                p.setMeta("lastPos", p.pos);
            }
        } else {
            p.setMeta("lastPos", p.pos);
        }
    }
}, 240000);

//<editor-fold defaultstate="collapsed" desc="-> Blacklist (Ban / Kick)">
const __dirname = dirname(decodeURI(new URL(import.meta.url).pathname)).replace(/^\/([A-Za-z]):\//, "$1:/");

let blacklistData = {};
if (fs.existsSync(__dirname + "/blacklist.json")) {
    blacklistData = JSON.parse(fs.readFileSync(__dirname + "/blacklist.json").toString());
}

function addToBlacklist(info) {
    blacklistData[info] = true;
    fs.writeFileSync(__dirname + "/blacklist.json", JSON.stringify(blacklistData, null, 4));
}
//</editor-fold>