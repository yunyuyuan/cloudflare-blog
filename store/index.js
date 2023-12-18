export const state = ()=>({
  lang: '中文'
})

export const mutations = {
  changeLang (state, lang){
    if (process.client){
      localStorage.setItem('i18n-lang', lang);
    }
    state.lang = lang
  }
}
