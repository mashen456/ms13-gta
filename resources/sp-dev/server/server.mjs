/// <reference types="@altv/types-server" />
import * as alt from 'alt-server';
import * as chat from 'chat';
import { getWeaponByName } from './weapons.mjs';

const playerSpawn = {
    x: 436.491,
    y: -982.172,
    z: 30.699,
    delay: 0,
    model: 'a_m_y_beachvesp_01'
}

alt.on('playerConnect', SpawnPlayer);
alt.on('playerDeath', (player, killer, weapon) => {
    SpawnPlayer(player);
});

function SpawnPlayer(player) {

    player.model = playerSpawn.model;
    player.spawn(playerSpawn.x, playerSpawn.y, playerSpawn.z, playerSpawn.delay);

}

chat.registerCmd('giveweapon', (player, args) => {
    if (args.length <= 0) {
        chat.send(player, '{FF0000} /giveweapon [weapon_name]')
        return;
    }

    let targetWeapon = getWeaponByName(args[0]);
    if (targetWeapon) {
        player.giveWeapon(targetWeapon.hash, 999, true);
        chat.send('You received weapon ' + args[0]);
    } else {
        chat.send(player, '{FF0000} Weapon type is not valid.')
    }

});