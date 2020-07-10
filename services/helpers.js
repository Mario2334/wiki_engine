const register = (Handlebars) => {
    //functions to compare values in if statement . but primarily can be used anywhere in handlebar
    let helper_func = {
        eq: (v1, v2) => v1 === v2,
        ne: (v1, v2) => v1 !== v2,
        ge:(v1, v2) => v1 > v2,
        le:(v1, v2) => v1 < v2
    }
    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        // register helpers
        for (let prop in helper_func) {
            Handlebars.registerHelper(prop, helper_func[prop]);
        }
    } else {
        // just return helpers object if we can't register helpers here
        return helper_func;
    }
}
module.exports = {
    register: register,
    helpers: register(null)
}

