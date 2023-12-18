import {parseDate} from "~/utils/filter";
import md5 from "md5";

const pwd = 'f0a4058fd33489695d53df156b77c724';
export const dontInput = "I don't want input the fucking pwd!!!"

export function checkPwd (v){
    return md5(v) === pwd
}

export function setCache (key, val){
    if (process.server) return '';
    window.localStorage.setItem('cache-'+key, val)
}

export function getCache (key){
    if (process.server) return '';
    return window.localStorage.getItem('cache-'+key)
}

export function delCache (key){
    if (process.server) return '';
    return window.localStorage.removeItem('cache-'+key)
}

// ************************************

import config from "~/rebuild/json/config.json";

function escapeXml (s){
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function genRss (items){
    if (config.rss.timeBy==='update'){
        const temp = items.slice();
        temp.sort((a, b)=>{
            return a.modifyTime>b.modifyTime?-1:1
        });
        items = temp
    }
    items = items.slice(0, parseInt(config.rss.count))
    const origin = location.origin;
    function createEl (tag, html, notEscape){
        const el = xml.createElement(tag);
        if (html) {
            html = html.toString()
            el.innerHTML = notEscape?html:escapeXml(html);
        }
        return el;
    }

    const xml = new DOMParser().parseFromString('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"></rss>', "application/xml");
    const rss = xml.getElementsByTagName('rss')[0];

    const channel = createEl('channel', '');
    channel.appendChild(createEl('title', config.rss.title))
    channel.appendChild(createEl('link', origin))
    channel.appendChild(createEl('description', config.rss.description))
    channel.appendChild(createEl('ttl', config.rss.ttl))
    channel.appendChild(createEl('category', config.rss.categories))
    channel.appendChild(createEl('lastBuildDate', parseDate(new Date().getTime(), false)));
    channel.appendChild(createEl('language', 'zh-cn'))

    for (const i of items){
        const item = createEl('item');
        item.appendChild(createEl('author', config.githubName));
        item.appendChild(createEl('title', i.name));
        item.appendChild(createEl('link', origin+'/article/'+i.file));
        item.appendChild(createEl('description', `
            <h3><b>${i.name}</b></h3>
            <span style="display: block">${i.summary}</span>
            <img src="${i.cover}" alt=""/>
        `, true));
        item.appendChild(createEl('category', i.tags.join('/')))
        item.appendChild(createEl('pubDate', parseDate((config.rss.timeBy==='create'?i.time:i.modifyTime), false)));
        item.appendChild(createEl('guid', i.time));

        channel.appendChild(item);
    }

    rss.appendChild(channel);
    return new XMLSerializer().serializeToString(xml);
}
