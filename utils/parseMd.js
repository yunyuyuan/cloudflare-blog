import {hljsAndInsertCopyBtn} from "~/utils/highlight";
import anchorImg from '!!file-loader!~/assets/svg/anchor.svg'
import checkImg from '!!file-loader!~/assets/svg/checked.svg'
import uncheckImg from '!!file-loader!~/assets/svg/unchecked.svg'
import markerImg from '!!file-loader!~/assets/svg/marker.svg'
import toggleArrow from '!!file-loader!~/assets/svg/toggle-arrow.svg'
import pangu from 'pangu'

const
    paragraphTabExtension = {
        type: 'lang',
        regex: /(^|[^\\])<<>>/g,
        replace: '$1&emsp;&emsp;'
    },
    anchorIdExtension = {
        type: 'lang',
        regex: /(^|[^\\])\[#([^#]*?)#]/g,
        replace: '$1<span class="anchor-id" id="anchor-id-$2"></span>'
    },
    anchorRefExtension = {
        type: 'lang',
        regex: /(^|[^\\])\[#(.*?)#([^#]*?)#]/g,
        replace: '$1<a data-anchor-id="anchor-id-$3" class="anchor-id-ref">$2</a>'
    },
    linkExtension = {
        type: 'lang',
        regex: /(^|[^\\])#\[(.*?)]\((.*?)\)/g,
        replace: '$1<a target="_blank" href="$3">$2</a>'
    },
    commonImgExtension = {
        type: 'lang',
        regex: /(^|[^\\])!\[(.*?)]\((.*?)\)/g,
        replace: (a, b, c, d) => {
            // sticker
            if (c === 'sticker') return a;
            const mather = c.match(/^(.*?)\[(.*?) x (.*?)]$/);
            if (!mather) {
                return `${b}<span class="image-container"><img alt="${c}" src="${d}"/><small class="desc">${c}</small></span>`
            }
            // with dimension
            const [_, alt, w, h] = mather;
            return `${b}<span class="image-container"><img alt="${alt}" style="${w ? `width: ${w} !important;` : ''}${h ? `height: ${h} !important;` : ''}" src="${d}"/><small class="desc">${alt}</small></span>`
        }
    },
    colorTextExtension = {
        type: 'lang',
        regex: /(^|[^\\])-\(([#a-zA-Z0-9]+): (.*?)\)-/g,
        replace: `$1<span style="color: $2">$3</span>`
    },
    writeFontExtension = {
        type: 'lang',
        regex: /(^|[^\\])-\(write-([\d.]+): (.*?)\)-/g,
        replace: `$1<span write-font style="font-size: $2rem">$3</span>`
    },
    htmlExtension = {
        type: 'lang',
        regex: /(^|[^\\])\[html]([\s\S]*?)\[\/html]/g,
        replace: `$1<span class="raw-html">$2</span>`
    },
    youtubeExtension = {
        type: 'lang',
        regex: /(^|[^\\])\[youtube]\[(.+?)]\((https?:\/\/.*?)\)\[\/youtube]/g,
        replace: `$1<div class="embed-video youtube">
                        <iframe src="$3" title="$2" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <small class="desc">$2</small>
                    </div>`
    },
    biliExtension = {
        type: 'lang',
        regex: /(^|[^\\])\[bili]\[(.+?)]\((https?:\/\/.*?)\)\[\/bili]/g,
        replace: `$1<div class="embed-video bili">
                        <iframe src="$3" title="$2" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <small class="desc">$2</small>
                    </div>`
    },
    fieldExtension = {
        type: 'lang',
        filter(text, converter) {
            return text.replace(/(^|\n)--(.*?)--\n([\s\S]+)\n-- --/g, (a, b, c, d) => {
                return `${b}<fieldset><legend>${c}</legend>${converter.makeHtml(d)}</fieldset>`
            })
        },
    },
    selfSiteUrlExtension = {
        type: 'lang',
        filter(text, converter) {
            return text.replace(/(^|[^\\])(#?){self}\((\d+)\)/g, (a, b, c, d) => {
                let target = '_self'
                if (c === '#'){
                    target = '_blank'
                }
                return `${b}<a target="${target}" data-self-site="${d}" class="self-site-link">
                                <img data-no-viewer src="" alt="cover"/>
                                <span>
                                    <strong></strong>
                                    <span></span>
                                </span>
                            </a>`
            })
        },
    },
    hidableExtension = {
        type: 'lang',
        filter(text, converter) {
            return text.replace(/(^|\n)==(.*?)==\n([\s\S]+)\n== ==/g, (a, b, c, d) => {
                return `${b}<div class="hidable" data-hidden>
                                <p onclick="this.parentElement.toggleAttribute('data-hidden')"><img src="${toggleArrow}"/>${c}</p>
                                <span>${converter.makeHtml(d)}</span>
                            </div>`
            })
        },
    }


import showdown from 'yunyuyuans-showdown';
import {timeStamp} from "@/utils/utils";
const options = {
    prefixHeaderId: '__markdown_header_id_',
    tables: true,
    tasklists: true,
    backslashEscapesHTMLTags: true,
    strikethrough: true
}
const converter = new showdown.Converter({
    ...options,
    extensions: [paragraphTabExtension, anchorIdExtension, anchorRefExtension, linkExtension, commonImgExtension, colorTextExtension, writeFontExtension,
        htmlExtension, youtubeExtension, biliExtension, fieldExtension, selfSiteUrlExtension, hidableExtension]
});
const commentConverter = new showdown.Converter({
    ...options,
    extensions: [paragraphTabExtension, anchorRefExtension, linkExtension, commonImgExtension, colorTextExtension, writeFontExtension,
        fieldExtension, youtubeExtension, biliExtension, selfSiteUrlExtension, hidableExtension]
});

export function parseMarkdown(text, isComment) {
  return isComment?commentConverter.makeHtml(text):converter.makeHtml(text)
}

// 二次处理html
export function processMdHtml(el, isComment, mdList) {
    // sticker
    el.querySelectorAll('img[alt=sticker]:not([parsed])').forEach(el => {
        el.setAttribute('parsed', '');
        const src = el.getAttribute('src');
        el.src = `/sticker/${src.replace(/^(.*?)\/\d*$/, '$1')}/${src.replace(/.*?\/(\d*)$/, '$1')}.png?ran=${timeStamp}`
    })
    // hljs
    el.querySelectorAll('pre>code:not(.hljs)').forEach(el => {
        hljsAndInsertCopyBtn(el)
    })
    if (!isComment){
        // 评论没有anchor
        el.querySelectorAll('h1[id]:not([parsed]), h2[id]:not([parsed]), h3[id]:not([parsed]), h4[id]:not([parsed]), h5[id]:not([parsed]), h6[id]:not([parsed])').forEach(el => {
            el.setAttribute('parsed', '');
            el.innerHTML = `<img src="${anchorImg}"/>${el.innerHTML}`
        })
    }
    // ul
    function rescueUl (el){
        el.querySelectorAll('ul>li:not(.task-list-item):not([parsed])').forEach(el => {
            el.setAttribute('parsed', '');
            el.innerHTML = `<img src="${markerImg}"/>${el.innerHTML}`;
            rescueUl(el);
        })
    }
    rescueUl(el);
    // ol
    el.querySelectorAll('ol:not([parsed])').forEach(el => {
        el.setAttribute('parsed', '');
        let start = +(el.getAttribute('start') || 1);
        el.children.forEach(sub => {
            sub.setAttribute('data-count', start);
            start++;
        })
    })
    // viewer
    el.querySelectorAll('img[alt]:not([alt=sticker]):not([data-viewer]):not([data-no-viewer])').forEach(el => {
        el.setAttribute('data-viewer', '')
    })
    // task
    el.querySelectorAll('input[type=checkbox]').forEach(el => {
        const span = document.createElement('img');
        span.src = el.checked ? checkImg : uncheckImg;
        el.parentElement.insertBefore(span, el);
        el.remove();
    })
    // 本站文章链接
    el.querySelectorAll('a[data-self-site].self-site-link').forEach(el=>{
        const articleId = el.getAttribute('data-self-site');
        const item = mdList.find(e=>e.file === articleId)||{};
        el.href = `/article/${articleId}`;
        el.querySelector('img').src = item.cover||'/image/error.jpg';
        el.querySelector('strong').innerText = item.name||'未知标题';
        el.querySelector('span > span').innerText = item.summary||'未知简介';
    })
    // 排版
    pangu.spacingElementByClassName('--markdown')
}
