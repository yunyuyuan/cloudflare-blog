import Vue from 'vue';
import dayjs from "dayjs";
import md5 from 'md5';

Vue.filter('time', parseDate)

export function parseDate (value, isShort){
    return new dayjs(value).format(`YYYY-MM-DD${!isShort ? ' HH:mm:ss' : ''}`)
}

const colorList = [
    '#ff1616', '#ac00d7',
    '#ff16aa', '#3934ff',
    '#1d94ec', '#00bf83',
    '#27ce00', '#82a500',
    '#bf8600', '#7000ff',
]

Vue.filter('color', function (value) {
    const v = md5(value).charAt(0);
    if (isNaN(parseInt(v))) {
        return colorList[Math.floor('abcdefghijklmnopqrstuvwxyz'.indexOf(v) / 2.6)]
    }
    return colorList[parseInt(v)]
})
