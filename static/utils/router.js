import store from '../utils/store.js';

import login from "../pages/login.js";  
import cregister from "../pages/cregister.js";
import pregister from "../pages/pregister.js";
import admin_services from "../pages/admin_services.js";
import customer_dashboard from "../pages/customer_dashboard.js";
import professional_dashboard from "../pages/professional_dashboard.js";
import customer_search from "../pages/customer_search.js";


const Home = {template: `<h1> Welcome to Home Page </h1>`}


const routes = [
    { path: '/', component: Home},
    { path: '/login', component: login },
    { path: '/cregister', component: cregister },
    { path: '/pregister', component: pregister},
    { path: '/admin_services', component: admin_services, meta: { requiresAuth: true }},
    { path: '/customer_dashboard', component: customer_dashboard, meta: { requiresAuth: true }},
    { path: '/professional_dashboard', component: professional_dashboard, meta: { requiresAuth: true }},
    { path: '/customer_search', component: customer_search, meta: { requiresAuth: true }},
]

const router = new VueRouter({
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!store.state.loggedIn) {
            next('/login');
        } else {
            next();
        }
    } else {
        next();
    }
});



export default router;
