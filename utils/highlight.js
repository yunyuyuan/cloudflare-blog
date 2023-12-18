import hljs from "highlight.js";

export function hljsAndInsertCopyBtn (el){
    const head = document.createElement('div');
    const img = document.createElement('img');
    img.src = '/image/code.png';
    const btn = document.createElement('span');
    addCopyEvent(el.parentElement, btn, el.classList[0], el.innerText);
    head.appendChild(img);
    head.appendChild(btn);
    el.parentElement.insertBefore(head, el);
    hljs.highlightBlock(el);
}

export function addCopyEvent (pre, btn, lang, code){
    btn.innerText = lang;
    pre.onmouseenter = ()=>{btn.innerText = '复制'}
    pre.onmouseleave = ()=>{btn.innerText = lang}
    btn.onclick = ()=>{
        const textArea = document.createElement("textarea");
        textArea.style.maxHeight = '0';
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
        btn.innerText = '复制成功'
    }
}
