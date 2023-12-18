export const state = ()=>({
  gitUtil: null,
  token: '',
  showLogin: false,
})
export const strict = false
export const mutations = {
  setGitUtil (state, payload){
    state.gitUtil = payload[0]
    state.token = payload[1]
  },
  toggleLogin (state, bool){
    state.showLogin = bool
  },
}
