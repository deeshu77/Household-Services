const store = new Vuex.Store({
  state: {
    auth_token : null,
    user_id : null,
    role : null,
    loggedIn : false,
},

mutations:{
    setUser(state){
      try{
        if(JSON.parse(localStorage.getItem('user'))){
            const user = JSON.parse(localStorage.getItem('user'));
            state.auth_token = user.token,
            state.user_id = user.id,
            state.loggedIn = true,
            state.role = user.role
        }
        console.log("User set in store:", state.user_id);
      }
      catch{
        console.log("Not logged in")
      }
    }
      
    },

    logout(state){
        state.auth_token = null,
        state.user_id = null,
        state.role = null,
        state.loggedIn = false,

        localStorage.removeItem('user')
    }
})

store.commit('setUser')
export default store