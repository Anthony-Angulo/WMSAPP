// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiProtevs: 'http://192.168.101.69',
  apiCRM: 'http://crm.ccfnweb.com.mx/apicrm/public/api',
  apiWMS: 'http://crm.ccfnweb.com.mx/apiwms/public/api',
  // apiWMS: 'http://192.168.101.23:8081/public/api',
  // apiCRM: 'http://192.168.101.23:8080/public/api',
  // apiSAP: 'http://192.168.101.104:5002'
  apiSAP: 'http://192.168.0.10:8886' 
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
