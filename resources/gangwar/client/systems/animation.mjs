import * as alt from 'alt';
import * as native from 'natives';

alt.log('Loaded: client->systems->animation.mjs');

const maxCountLoadTry = 255;
let activeDict = null, activeAnim = null;

/*
	Flags need to be added together for desired effects.
	ie. Upper Body + Last Frame = 16 + 2 = 18 <-- This value.
	normal = 0
	repeat = 1
	stop_last_frame = 2
	unk1 = 4
	unk2_air = 8
	upperbody = 16
	enablePlCtrl = 32
	unk3 = 64
	cancelable = 128
	unk4_creature = 256
	unk5_freezePos = 512
	unk6_rot90 = 1024
*/

alt.onServer('animation:Play', data => {
    playAnimation(alt.Player.local, data.dict, data.name, data.duration, data.flag);
});
alt.on('animation:Play', data => {
    playAnimation(alt.Player.local, data.dict, data.name, data.duration, data.flag);
});

alt.on('animation:Clear', ent => {
    alt.Player.local.laying = false;
    native.clearPedTasks(alt.Player.local.scriptID);
    if (!alt.Player.local.vehicle) {
        native.clearPedSecondaryTask(alt.Player.local.scriptID);
    }
});

export function playAnimation(player, dict, name, duration, flag) {
    activeDict = dict;
    activeAnim = name;
    
    startAnimation(player, dict, name, duration, flag);
}

function startAnimation(player, dict, name, duration, flag) {
    native.clearPedTasks(alt.Player.local.scriptID);
    
    let startAnimation = function () {
        native.taskPlayAnim(
            player.scriptID,
            dict,
            name,
            1,
            -1,
            duration,
            flag,
            1.0,
            false,
            false,
            false
        );
    };
    
    if (native.hasAnimDictLoaded(dict)) {
        startAnimation();
        return;
    }
    
    let res = loadAnim(dict);
    res.then(() => startAnimation);
}

export async function loadAnim(dict) {
    return new Promise(resolve => {
        native.requestAnimDict(dict);

        let count = 0;
        let inter = alt.setInterval(() => {
            if (count > maxCountLoadTry) {
                alt.clearInterval(inter);
                return;
            }

            if (native.hasAnimDictLoaded(dict)) {
                resolve(true);
                alt.clearInterval(inter);
                return;
            }

            count += 1;
        }, 5);
    });
}
