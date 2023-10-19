class Errors {
    static fatal(msg) {
        if(msg == '' || typeof msg == 'undefined') {
            var msg = 'An error occurred. Please check your connection and try again';
        }

        Alerts.alert(msg);

        console.log('Ajax failed');
        console.log(msg);
    }
}