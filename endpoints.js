module.exports = {
    Login: {
        url: 'https://onlinebusiness.icbc.com/deas-api/v1/webLogin/webLogin',
        type: 'put',
        referer: 'https://onlinebusiness.icbc.com/webdeas-ui/login;type=driver',
        skipAuth: true
    },
    Search: {
        url: 'https://onlinebusiness.icbc.com/deas-api/v1/web/getAvailableAppointments',
        type: 'post',
        referer: 'https://onlinebusiness.icbc.com/webdeas-ui/booking'
    }
};
