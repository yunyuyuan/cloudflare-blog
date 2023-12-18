import Vue from 'vue';

Vue.directive('tips', {
  bind (el, binding){
    el.title = binding.value
    // const body = document.querySelector('section.body');
    // el.addEventListener('mouseenter', ()=>{
    //   const {left, right, top, bottom, width, height} = el.getBoundingClientRect();
    //   const tipsEl = document.createElement('div');
    //   const span = document.createElement('span');
    //   const arrow = document.createElement('svg');
    //   tipsEl.className = 'v-tips';
    //   tipsEl.id = "v-tips-id-"+(new Date().getTime().toString());
    //   span.innerHTML = binding.value;
    //   tipsEl.appendChild(span);
    //   tipsEl.appendChild(arrow);
    //   arrow.outerHTML = '<svg class="arrow" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M440.59395936 37.12998222l-463.17977726 463.17977727a100.99864286 100.99864286 0 0 0 71.40604065 172.4046835L975.17977725 672.71444299a100.99864286 100.99864286 0 0 0 71.40604065-172.4046835l-463.17977726-463.17977727a100.99864286 100.99864286 0 0 0-142.81208128 0z"></path></svg>'
    //   tipsEl.style.top = `${top+body.scrollTop}px`;
    //   tipsEl.style.left = `${left}px`;
    //   tipsEl.style.width = `${width}px`;
    //   body.appendChild(tipsEl);
    // })
    // el.addEventListener('mouseleave', (e)=>{
    //   document.querySelector('.v-tips').remove()
    // })
  },
  componentUpdated (){

  },
  update (el, binding){
    el.title = binding.value
  },
})
